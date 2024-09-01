from django.core.management.commands.runserver import Command as RunserverCommand
import ssl
import os

class Command(RunserverCommand):
    
    help = 'Run Django development server with SSL support'
    
    def get_handler(self, *args, **options):
        handler = super().get_handler(*args, **options)
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        cert_file = os.path.join(base_dir, '../../ssl/cert.pem')
        key_file = os.path.join(base_dir, '../../ssl/key.pem')
        
        
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ssl_context.load_cert_chain(certfile=cert_file, keyfile=key_file)
        
        return ssl_context.wrap_socket(handler, server_side=True)