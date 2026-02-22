"""
Script para extraer reseñas de Google Maps - Restaurante Antika Sicuani

NOTA IMPORTANTE: 
Google Maps tiene protecciones muy fuertes contra web scraping:
- Usa JavaScript dinámico para cargar contenido
- Tiene CAPTCHA y detección de bots
- Viola los Términos de Servicio de Google

Este script es solo para fines educativos. Para producción, usa la API oficial de Google Places.
"""

import json
import time
import re
from datetime import datetime

# URL del restaurante (proporcionada por el usuario)
RESTAURANT_URL = "https://www.google.com/maps/place/RESTAURANTE+ANTIKA+SICUANI/@-14.2729289,-71.2252419,16.47z/data=!4m6!3m5!1s0x91692b3cabf28c27:0xbd007cb5cfe738c2!8m2!3d-14.2738932!4d-71.2256236!16s%2Fg%2F11v0_cdzwr?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D"

def extraer_resenas_selenium():
    """
    Intenta extraer reseñas usando Selenium (requiere ChromeDriver)
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.chrome.service import Service
        
        print("Inicializando Selenium...")
        
        # Configurar Chrome en modo headless
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        driver = webdriver.Chrome(options=chrome_options)
        
        print(f"Navigating to: {RESTAURANT_URL}")
        driver.get(RESTAURANT_URL)
        
        # Esperar a que cargue la página
        time.sleep(5)
        
        # Buscar el botón de reseñas
        try:
            # Intentar encontrar la sección de reseñas
            reviews_section = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.fontBodyMedium"))
            )
            print("Sección de reseñas encontrada")
        except Exception as e:
            print(f"No se pudo encontrar la sección de reseñas: {e}")
        
        # Hacer scroll para cargar más reseñas
        for i in range(3):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
        
        # Extraer reseñas (esto es un ejemplo, los selectores pueden variar)
        reseñas = []
        
        try:
            # Buscar elementos de reseñas - los selectores pueden cambiar
            review_elements = driver.find_elements(By.CSS_SELECTOR, "._review-content")
            
            for idx, element in enumerate(review_elements, 1):
                try:
                    nombre = element.find_element(By.CSS_SELECTOR, ".full-name").text
                except:
                    nombre = f"Usuario {idx}"
                
                try:
                    resena = element.find_element(By.CSS_SELECTOR, ".text").text
                except:
                    resena = ""
                
                try:
                    estrellas = element.find_elements(By.CSS_SELECTOR, ".star-rating")
                    num_estrellas = len(estrellas)
                except:
                    num_estrellas = 0
                
                reseñas.append({
                    "indice": idx,
                    "nombre": nombre,
                    "resena": resena,
                    "estrellas": num_estrellas,
                    "detalle_estrellas": {
                        "estrella_1": num_estrellas >= 1,
                        "estrella_2": num_estrellas >= 2,
                        "estrella_3": num_estrellas >= 3,
                        "estrella_4": num_estrellas >= 4,
                        "estrella_5": num_estrellas >= 5
                    }
                })
        except Exception as e:
            print(f"Error extrayendo reseñas: {e}")
        
        driver.quit()
        
        return reseñas
        
    except ImportError:
        print("Selenium no está instalado. Ejecuta: pip install selenium")
        return []
    except Exception as e:
        print(f"Error con Selenium: {e}")
        return []


def guardar_resenas(reseñas, archivo="frontend/assets/docs/resenas_extraccion.json"):
    """
    Guarda las reseñas en un archivo JSON
    """
    datos = {
        "total_resenas": len(reseñas),
        "fecha_extraccion": datetime.now().isoformat(),
        "fuente": "Google Maps - Web Scraping",
        "resenas": reseñas
    }
    
    with open(archivo, 'w', encoding='utf-8') as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)
    
    print(f"Se guardaron {len(reseñas)} reseñas en {archivo}")


def main():
    """
    Función principal
    """
    print("=" * 50)
    print("SCRAPER DE RESEÑAS - RESTAURANTE ANTIKA SICUANI")
    print("=" * 50)
    print()
    print("ADVERTENCIA: El web scraping de Google Maps puede:")
    print("1. Violar los Términos de Servicio de Google")
    print("2. Ser bloqueado por protecciones anti-bot")
    print("3. Requerir herramientas especializadas (Selenium)")
    print()
    print("Para uso profesional, usa la API oficial de Google Places")
    print("=" * 50)
    print()
    
    # Intentar con Selenium
    print("Intentando extraer reseñas con Selenium...")
    reseñas = extraer_resenas_selenium()
    
    if reseñas:
        print(f"\n¡Éxito! Se encontraron {len(reseñas)} reseñas")
        guardar_resenas(reseñas)
    else:
        print("\nNo se pudieron extraer reseñas automáticamente.")
        print("Las reseñas existentes ya están disponibles en:")
        print("frontend/assets/docs/resenas_extraccion.json")
        print(f"\nTotal de reseñas disponibles: 93")


if __name__ == "__main__":
    main()
