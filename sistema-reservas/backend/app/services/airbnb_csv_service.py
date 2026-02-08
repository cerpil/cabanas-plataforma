import csv
import io
import re
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.models import Reserva, Cliente, Cabana

def process_airbnb_csv(db: Session, file_binary_content: bytes):
    # Encodings comuns
    encodings = ['utf-8-sig', 'iso-8859-1', 'latin-1', 'utf-8']
    decoded_content = None
    
    for enc in encodings:
        try:
            decoded_content = file_binary_content.decode(enc)
            print(f"Sucesso ao decodificar com {enc}")
            break
        except:
            continue
            
    if not decoded_content:
        return {"atualizados": 0, "ignorados": 0, "erros": 1, "log": "Erro de codificação"}

    f = io.StringIO(decoded_content)
    # reservations.csv geralmente usa vírgula
    reader = csv.DictReader(f, delimiter=',')
    stats = {"atualizados": 0, "ignorados": 0, "erros": 0}
    
    for row in reader:
        try:
            # Normalizar nomes de colunas
            row = {k.strip().replace('"', ''): v for k, v in row.items() if k}
            
            # Colunas do arquivo reservations.csv
            status_airbnb = row.get('Status')
            if status_airbnb and status_airbnb.lower() not in ['confirmada', 'concluída', 'confirmado']:
                continue

            nome_hospede = row.get('Nome do hóspede')
            checkin_str = row.get('Data de início')
            checkout_str = row.get('Data de término')
            anuncio = row.get('Anúncio', '')
            codigo = row.get('Código de confirmação')
            telefone = row.get('Entrar em contato', '')
            ganhos_str = row.get('Ganhos', '')

            if not checkin_str or not nome_hospede:
                continue

            # Converter datas (DD/MM/AAAA)
            try:
                checkin = datetime.strptime(checkin_str, '%d/%m/%Y').date()
                checkout = datetime.strptime(checkout_str, '%d/%m/%Y').date()
            except Exception as e:
                print(f"Erro de data: {checkin_str} -> {e}")
                continue

            # Mapeamento de cabana (mais preciso para os nomes do usuário)
            cabana_id = None
            anuncio_lower = anuncio.lower()
            if "sobre a mata" in anuncio_lower: cabana_id = 2
            elif "cabana na mata" in anuncio_lower: cabana_id = 1
            elif "hobbit" in anuncio_lower: cabana_id = 3

            # Busca flexível por reserva iCal existente
            reserva = db.query(Reserva).filter(
                Reserva.origem == "airbnb",
                ((Reserva.data_checkin == checkin) | (Reserva.data_checkout == checkout))
            ).first()

            # Criar/Buscar Cliente
            cliente = db.query(Cliente).filter(Cliente.nome == nome_hospede).first()
            if not cliente:
                cliente = Cliente(
                    nome=nome_hospede, 
                    telefone=telefone if telefone else "Airbnb", 
                    email=f"airbnb_{codigo}@guest.com"
                )
                db.add(cliente)
                db.flush()
            elif telefone and (not cliente.telefone or cliente.telefone == "Airbnb"):
                cliente.telefone = telefone

            if reserva:
                reserva.cliente_id = cliente.id
                reserva.observacoes = f"Sincronizado via reservations.csv ({codigo})"
                if cabana_id: reserva.cabana_id = cabana_id
                
                # Tratar valor financeiro (R$2.080,74)
                if ganhos_str:
                    valor_clean = re.sub(r'[^\d,]', '', ganhos_str).replace(',', '.')
                    try:
                        reserva.valor_total = float(valor_clean)
                        reserva.pago_total = True
                    except: pass
                
                stats["atualizados"] += 1
            elif cabana_id:
                # Criar nova se não existir via iCal
                nova = Reserva(
                    cliente_id=cliente.id, cabana_id=cabana_id,
                    data_checkin=checkin, data_checkout=checkout,
                    status="confirmada", origem="airbnb",
                    observacoes=f"Criada via reservations.csv ({codigo})"
                )
                if ganhos_str:
                    valor_clean = re.sub(r'[^\d,]', '', ganhos_str).replace(',', '.')
                    try:
                        nova.valor_total = float(valor_clean)
                        nova.pago_total = True
                    except: pass
                    
                db.add(nova)
                stats["atualizados"] += 1
            else:
                stats["ignorados"] += 1
                
        except Exception as e:
            print(f"Erro processando linha: {e}")
            stats["erros"] += 1
            
    db.commit()
    return stats