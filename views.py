import json

from cartoview.app_manager.models import App, AppInstance
from cartoview.app_manager.views import StandardAppViews
from django.shortcuts import HttpResponse, render
from geonode.layers.views import layer_detail
from django.conf.urls import patterns, url
from geonode.utils import resolve_object
from geonode.maps.models import Map
import base64
from django.utils.translation import ugettext as _


from . import APP_NAME
_js_permissions_mapping = {
    'whoCanView': 'view_resourcebase',
    'whoCanChangeMetadata': 'change_resourcebase_metadata',
    'whoCanDelete': 'delete_resourcebase',
    'whoCanChangeConfiguration': 'change_resourcebase'
}
_PERMISSION_MSG_GENERIC = _('You do not have permissions for this map.')


def change_dict_None_to_list(access):
    for permission, users in list(access.items()):
        if not users:
            access[permission] = []


def _resolve_map(request, id, permission='base.change_resourcebase',
                 msg=_PERMISSION_MSG_GENERIC, **kwargs):
    '''
    Resolve the Map by the provided typename and check the optional permission.
    '''
    if id.isdigit():
        key = 'pk'
    else:
        key = 'urlsuffix'
    return resolve_object(request, Map, {key: id}, permission=permission,
                          permission_msg=msg, **kwargs)


class BasicViewer(StandardAppViews):
    def get_users_permissions(self, access, initial, owner):
        change_dict_None_to_list(access)
        users = []
        for permission_users in list(access.values()):
            if permission_users:
                users.extend(permission_users)
        users = set(users)
        for user in users:
            user_permissions = []
            for js_permission, gaurdian_permission in \
                    list(_js_permissions_mapping.items()):
                if user in access[js_permission]:
                    user_permissions.append(gaurdian_permission)
            if len(user_permissions) > 0 and user != owner:
                initial['users'].update({'{}'.format(user): user_permissions})
        if not access["whoCanView"]:
            initial['users'].update({'AnonymousUser': [
                'view_resourcebase',
            ]})

    def save(self, request, instance_id=None):
        user = request.user
        res_json = dict(success=False)
        data = json.loads(request.body)
        config = data.get('config', None)
        map_id = data.get('map', None)
        title = data.get('title', "")
        access = data.get('access', None)
        keywords = data.get('keywords', [])
        config.update(access=access, keywords=keywords)
        config = json.dumps(data.get('config', None))
        abstract = data.get('abstract', "")
        if instance_id is None:
            instance_obj = AppInstance()
            instance_obj.app = App.objects.get(name=self.app_name)
            instance_obj.owner = user
        else:
            instance_obj = AppInstance.objects.get(pk=instance_id)
            user = instance_obj.owner

        instance_obj.title = title
        instance_obj.config = config
        instance_obj.abstract = abstract
        instance_obj.map_id = map_id
        instance_obj.save()
        owner_permissions = [
            'view_resourcebase',
            'download_resourcebase',
            'change_resourcebase_metadata',
            'change_resourcebase',
            'delete_resourcebase',
            'change_resourcebase_permissions',
            'publish_resourcebase',
        ]
        permessions = {
            'users': {
                '{}'.format(request.user.username): owner_permissions,
            }
        }
        self.get_users_permissions(access, permessions, user.username)
        instance_obj.set_permissions(permessions)
        if hasattr(instance_obj, 'keywords') and keywords:
            new_keywords = [
                k for k in keywords if k not in instance_obj.keyword_list()]
            instance_obj.keywords.add(*new_keywords)

        res_json.update(dict(success=True, id=instance_obj.id))
        return HttpResponse(json.dumps(res_json),
                            content_type="application/json")

    def layer_view(self, request, layername):
        layer = layer_detail(
            request, layername).context_data['resource']
        return render(request, '%s/layer_view.html' % (self.app_name),
                      context={'layer': layer})

    def map_thumbnail(self, request, mapid):
        if request.method == 'POST':
            map_obj = _resolve_map(request, mapid)
            try:
                try:
                    preview = json.loads(request.body).get('preview', None)
                except:
                    preview = None

                if preview and preview == 'react':
                    format, image = json.loads(
                        request.body)['image'].split(';base64,')
                    image = base64.b64decode(image)

                    if not image:
                        return
                filename = "map-%s-thumb.png" % map_obj.uuid
                map_obj.save_thumbnail(filename, image)

                return HttpResponse('Thumbnail saved')
            except BaseException:
                return HttpResponse(
                    content='error saving thumbnail',
                    status=500,
                    content_type='text/plain'
                )

    def get_url_patterns(self):
        urls = super(BasicViewer, self).get_url_patterns()
        urls += patterns('',
                         url(r'^(?P<layername>[^/]*)/view/$',
                             self.layer_view,
                             name='%s.layer.view' % self.app_name),
                         url(r'^(?P<mapid>\d+)/thumbnail$',
                             self.map_thumbnail, name='%s_map_thumbnail' % self.app_name),
                         )
        return urls


basic_viewer = BasicViewer(APP_NAME)
