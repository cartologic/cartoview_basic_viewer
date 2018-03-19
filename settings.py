import os
import sys
import cartoview_basic_viewer
current_folder = os.path.dirname(cartoview_basic_viewer.__file__)
TEMPLATES[0]['DIRS'] = [os.path.join(
    current_folder, 'templates')]+TEMPLATES[0]['DIRS']
