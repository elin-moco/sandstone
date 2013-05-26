from distutils.dir_util import copy_tree
import glob
import os
import shutil
from django.core.management.base import NoArgsCommand
import sandstone


class Command(NoArgsCommand):
    help = 'Update render sandstone javascript files.'
    option_list = NoArgsCommand.option_list
    js_files = ('replace_urls.js', 'tabzilla.js')

    def handle_noargs(self, **options):
        self.options = options
        css_path = os.path.dirname(os.path.realpath(sandstone.__file__)) + '/media/css/sandstone/'
        fonts_path = os.path.dirname(os.path.realpath(sandstone.__file__)) + '/media/fonts/'
        # if not os.path.exists(css_path):
        #     os.makedirs(css_path)
        # for filename in glob.glob(os.path.join('media/css/sandstone', '*.css')):
        #     shutil.copy(filename, css_path)
        copy_tree('media/css/sandstone', css_path)
        copy_tree('media/fonts', fonts_path)


