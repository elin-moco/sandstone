from .base import *  # noqa
try:
    from .local import *  # noqa
except ImportError, exc:
    exc.args = tuple(['%s (did you rename settings/local.py-dist?)' % exc.args[0]])
    raise exc


if DEV:
    ALLOWED_HOSTS = ['*']

