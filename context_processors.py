# -*- coding: utf-8 -*-
from __future__ import (absolute_import, division, print_function,
                        unicode_literals)

from builtins import *
from django.conf import settings
from future import standard_library

standard_library.install_aliases()


def geocoding_processor(request):
    defaults = {
        'OPENCAGE_KEY': getattr(settings, 'OPENCAGE_KEY', None),
    }
    return defaults
