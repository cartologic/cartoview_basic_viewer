from django.conf import settings
from future import standard_library

standard_library.install_aliases()


def geocoding_processor(request):
    defaults = {
        'OPENCAGE_KEY': getattr(settings, 'OPENCAGE_KEY', None),
    }
    return defaults
