from django.core.management.commands.runserver import Command as RunserverCommand
import ssl

class Command(RunserverCommand):
    def get_handler(self, *args, **options):
        handler = super().get_handler(*args, **options)
        
        cert_file = 'ssl/cert.pem'
        key_file = 'ssl/key.pem'
        
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ssl_context.load_cert_chain(certfile=cert_file, keyfile=key_file)
        
        return ssl_context.wrap_socket(handler, server_side=True)