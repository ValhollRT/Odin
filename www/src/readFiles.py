import os
import os

def exportar_a_txt(nombre_archivo_destino):
  """
  Concatena el contenido de todos los archivos .ts, .tsx y .css de la carpeta 
  actual y sus subcarpetas en un único archivo .txt.

  Args:
    nombre_archivo_destino: El nombre del archivo .txt donde se escribirá el contenido.
  """

  ruta_origen = os.path.dirname(os.path.abspath(__file__))
  ruta_archivo_destino = os.path.join(ruta_origen, nombre_archivo_destino)  # Construye la ruta completa

  with open(ruta_archivo_destino, "w") as f_destino:
    for root, _, files in os.walk(ruta_origen):
      for file in files:
        if file.endswith((".ts", ".tsx", ".css")):
          ruta_archivo_origen = os.path.join(root, file)
          
          f_destino.write(f"---- {ruta_archivo_origen} ----\n")
          
          with open(ruta_archivo_origen, "r") as f_origen:
            f_destino.write(f_origen.read())
            f_destino.write("\n\n")

if __name__ == "__main__":
  nombre_archivo_destino = "salida.txt"  # Nombre del archivo de destino en la misma carpeta
  exportar_a_txt(nombre_archivo_destino)