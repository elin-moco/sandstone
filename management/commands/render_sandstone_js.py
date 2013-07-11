import os
from django.core.management.base import NoArgsCommand
from django.template.loader import render_to_string
from bedrock.sandstone.settings import *


LOCAL_URL_MAP = {
    MOCO_URL: LOCAL_MOCO_URL,
    BLOG_URL: LOCAL_BLOG_URL,
    TECH_URL: LOCAL_TECH_URL,
    MYFF_URL: LOCAL_MYFF_URL,
    FFCLUB_URL: LOCAL_FFCLUB_URL,
}


class Command(NoArgsCommand):
    help = 'Render sandstone javascript files.'
    option_list = NoArgsCommand.option_list
    js_files = ('replace_urls.js', 'tabzilla.js')

    def handle_noargs(self, **options):
        self.options = options
        # js_path = os.path.dirname(os.path.realpath(sandstone.__file__)) + '/media/js/sandstone/'
        js_path = 'media/js/sandstone/'
        if not os.path.exists(js_path):
            os.makedirs(js_path)
        for js_file in self.js_files:
            file = open(js_path + js_file, 'w')
            file.write(render_to_string('sandstone/' + js_file, {'URL_MAP': LOCAL_URL_MAP}).encode('utf8'))
            file.close()
