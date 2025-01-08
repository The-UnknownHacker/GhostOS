from flask import Blueprint, render_template, send_from_directory

main = Blueprint('main', __name__)

@main.route('/')
def boot():
    return render_template('boot.html')

@main.route('/welcome')
def welcome():
    return render_template('welcome.html')

@main.route('/desktop')
def desktop():
    return render_template('desktop.html')

@main.route('/Terminal')
def terminal():
    return render_template('apps/terminal.html')

@main.route('/Minecraft')
def minecraft():
    return render_template('apps/minecraft.html')

@main.route('/GhostAI')
def ghostai():
    return render_template('apps/ghostai.html')

@main.route('/GhostEdit')
def ghostedit():
    return render_template('apps/ghostedit.html')

@main.route('/Calculator')
def calculator():
    return render_template('apps/calculator.html')

@main.route('/Notes')
def notes():
    return render_template('apps/notes.html')

@main.route('/Clock')
def clock():
    return render_template('apps/clock.html')

@main.route('/Settings')
def settings():
    return render_template('apps/settings.html')

@main.route('/static/images/<path:filename>')
def serve_icon(filename):
    return send_from_directory('static/images', filename) 