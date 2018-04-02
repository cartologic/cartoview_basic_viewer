from django import template
from django.core.urlresolvers import reverse
import json
register = template.Library()

@register.simple_tag
def reverse_url(url_name, *args, **kwargs):
    url = None
    try:
        url = reverse(url_name, args=args, kwargs=kwargs)
    except:
        pass
    return json.dumps(url)
