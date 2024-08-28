from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

import videochat.ws_urls

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            videochat.ws_urls.websocket_urlpatterns
        )
    )
})