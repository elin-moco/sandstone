from distutils.dir_util import copy_tree
import glob
import os
import shutil
from django.core.management.base import NoArgsCommand
import bedrock.sandstone


class Command(NoArgsCommand):
    help = 'Update render sandstone javascript files.'
    option_list = NoArgsCommand.option_list

    def handle_noargs(self, **options):
        self.options = options
        js_path = os.path.dirname(os.path.realpath(bedrock.sandstone.__file__)) + '/media/js/sandstone/'
        if not os.path.exists(js_path):
            os.makedirs(js_path)

        shutil.copy('media/js/base/nav-main-resp.js', js_path)
        shutil.copy('media/js/sandstone-tabzilla-all.js', js_path)
        shutil.copy('media/js/sandstone-tabzilla-min.js', js_path)
        shutil.copy('media/js/sandstone-tabzilla-nav-all.js', js_path)
        shutil.copy('media/js/sandstone-tabzilla-nav-min.js', js_path)
        shutil.copy('media/js/sandstone/tabzilla.js', js_path)

