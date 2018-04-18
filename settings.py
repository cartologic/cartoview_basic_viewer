import os
import sys
import basic_viewer
current_folder = os.path.dirname(basic_viewer.__file__)
TEMPLATES[0]['DIRS'] = [os.path.join(
    current_folder, 'templates')]+TEMPLATES[0]['DIRS']
