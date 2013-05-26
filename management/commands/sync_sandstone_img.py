from distutils.dir_util import copy_tree
import os
from django.core.management.base import NoArgsCommand
import sandstone


class Command(NoArgsCommand):
    help = 'Update render sandstone javascript files.'
    option_list = NoArgsCommand.option_list
    js_files = ('replace_urls.js', 'tabzilla.js')

    def handle_noargs(self, **options):
        self.options = options
        img_path = os.path.dirname(os.path.realpath(sandstone.__file__)) + '/media/img/sandstone/'
        copy_tree('media/img/sandstone', img_path)
        img_path = os.path.dirname(os.path.realpath(sandstone.__file__)) + '/media/img/tabzilla/'
        copy_tree('media/img/tabzilla', img_path)


