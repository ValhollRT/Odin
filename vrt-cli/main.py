import gi
import os
import subprocess

gi.require_version('Gtk', '3.0')
gi.require_version('AppIndicator3', '0.1')

from gi.repository import Gtk as gtk, AppIndicator3 as appindicator

APPINDICATOR_ID = 'myAppIndicator'

def main():
    indicator = appindicator.Indicator.new(
        "miappindicator",
        "./icons/geometry.svg",
        appindicator.IndicatorCategory.SYSTEM_SERVICES
    )
    indicator.set_status(appindicator.IndicatorStatus.ACTIVE)
    indicator.set_menu(build_menu())
    indicator.set_icon_theme_path( os.getenv( "HOME" ))
    #indicator.set_icon_full("./icons/geometry.svg", "Descripción del Icono")

    
    directorio_actual = os.path.dirname(os.path.realpath(__file__))
    print("El script se está ejecutando en:", directorio_actual)

    gtk.main()

def build_menu():
    menu = gtk.Menu()
    item_hello = gtk.MenuItem(label='Hello, vrt-cli')
    item_hello.connect('activate', hello)
    menu.append(item_hello)
    
    item_create_db = gtk.MenuItem(label='Create new Database')
    item_create_db.connect('activate', create_database)
    menu.append(item_create_db)

    item_quit = gtk.MenuItem(label='Quit')
    item_quit.connect('activate', quit)
    menu.append(item_quit)

    menu.show_all()
    return menu

def hello(_):
    print("Hello, vrt-cli!")

def create_database(_):
    try:
        os.chdir("./docker")
        
        subprocess.run(["docker", "rm", "-f", "odin-postgres"], check=False)  # check=False para ignorar errores si el contenedor no existe
        subprocess.run(["docker", "compose", "down"], check=True)
        subprocess.run(["docker", "compose", "up", "-d"], check=True)
        os.chdir("..")
        print("Contenedor de base de datos creado y arrancado con éxito.")
    except subprocess.CalledProcessError as e:
        print("Error al ejecutar Docker Compose:", e)

def quit(_):
    gtk.main_quit()

if __name__ == '__main__':
    main()
