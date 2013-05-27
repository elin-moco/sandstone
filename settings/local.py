from sandstone.settings.base import *

LOCAL_MOCO_URL = 'bedrock.inspire.mozilla.com.tw'
LOCAL_BLOG_URL = 'blog.inspire.mozilla.com.tw'
LOCAL_TECH_URL = 'tech.inspire.mozilla.com.tw'
LOCAL_MYFF_URL = 'stage.myfirefox.com.tw'
LOCAL_FFCLUB_URL = 'ffclub.inspire.mozilla.com.tw'

try:
    from settings.local import LOCAL_MOCO_URL
except ImportError:
    pass

try:
    from settings.local import LOCAL_BLOG_URL
except ImportError:
    pass
try:
    from settings.local import LOCAL_TECH_URL
except ImportError:
    pass
try:
    from settings.local import LOCAL_MYFF_URL
except ImportError:
    pass
try:
    from settings.local import LOCAL_FFCLUB_URL
except ImportError:
    pass
