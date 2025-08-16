from flask import Flask
from config import Config

def create_app():
    app = Flask(__name__)
    
    app.config.from_object(Config)
    
    with app.app_context():
        from . import routes
        from .models import db
        db.init_app(app)
        db.create_all()

    return app