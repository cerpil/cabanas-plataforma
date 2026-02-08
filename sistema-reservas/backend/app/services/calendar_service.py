from icalendar import Calendar, Event
from datetime import datetime, date
import requests
from sqlalchemy.orm import Session
from ..models.models import Reserva, Cabana, Cliente
import uuid

def generate_cabana_ical(db: Session, cabana_id: int):
    cabana = db.query(Cabana).filter(Cabana.id == cabana_id).first()
    if not cabana:
        return None

    reservas = db.query(Reserva).filter(
        Reserva.cabana_id == cabana_id,
        Reserva.status != "cancelada"
    ).all()

    cal = Calendar()
    cal.add('prodid', '-//Gestao de Cabanas//Sincronizacao Airbnb//BR')
    cal.add('version', '2.0')
    cal.add('x-wr-calname', f'Calendário {cabana.nome}')

    for res in reservas:
        event = Event()
        event.add('summary', f'Reserva {res.id} - {res.status}')
        event.add('dtstart', res.data_checkin)
        event.add('dtend', res.data_checkout)
        event.add('uid', f'reserva-{res.id}@gestaocabanas.com')
        event.add('description', f'Hóspede: {res.cliente.nome if res.cliente else "N/A"}')
        cal.add_component(event)

    return cal.to_ical()

def sync_airbnb_calendar(db: Session, cabana_id: int):
    cabana = db.query(Cabana).filter(Cabana.id == cabana_id).first()
    if not cabana:
        print(f"Erro: Cabana {cabana_id} não encontrada")
        return False, 0
    if not cabana.airbnb_ical_url:
        print(f"Erro: Cabana {cabana_id} não possui URL iCal configurada")
        return False, 0

    try:
        print(f"Buscando calendário em: {cabana.airbnb_ical_url}")
        response = requests.get(cabana.airbnb_ical_url, timeout=10)
        if response.status_code != 200:
            print(f"Erro HTTP {response.status_code} ao buscar calendário")
            return False, 0
        
        print("Calendário recebido, processando iCal...")
        gcal = Calendar.from_ical(response.content)
        
        airbnb_cliente = db.query(Cliente).filter(Cliente.nome == "Airbnb Import").first()
        if not airbnb_cliente:
            airbnb_cliente = Cliente(nome="Airbnb Import", telefone="0", email="airbnb@import.com")
            db.add(airbnb_cliente)
            db.commit()
            db.refresh(airbnb_cliente)

        count = 0
        for component in gcal.walk():
            if component.name == "VEVENT":
                summary = component.get('summary', 'Reserva Airbnb')
                # Ignorar bloqueios do Airbnb que não são reservas (ex: "Airbnb (Not available)")
                if "not available" in summary.lower():
                    continue

                start = component.get('dtstart').dt
                end = component.get('dtend').dt
                
                if isinstance(start, datetime):
                    start = start.date()
                if isinstance(end, datetime):
                    end = end.date()

                exists = db.query(Reserva).filter(
                    Reserva.cabana_id == cabana_id,
                    Reserva.data_checkin == start,
                    Reserva.data_checkout == end,
                    Reserva.origem == "airbnb"
                ).first()

                if not exists:
                    nova_reserva = Reserva(
                        cliente_id=airbnb_cliente.id,
                        cabana_id=cabana_id,
                        data_checkin=start,
                        data_checkout=end,
                        status="confirmada",
                        origem="airbnb",
                        valor_total=0.0,
                        observacoes=f"Importado: {summary}"
                    )
                    db.add(nova_reserva)
                    count += 1
        
        db.commit()
        print(f"Sincronização concluída: {count} novas reservas.")
        return True, count
    except Exception as e:
        import traceback
        print(f"Erro fatal na sincronização: {e}")
        print(traceback.format_exc())
        return False, 0
