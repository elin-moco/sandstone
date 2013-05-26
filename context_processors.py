import settings


def urls(request):
    """
    Adds media-related context variables to the context.

    """
    return {
        'NIGHTLY_URL': settings.NIGHTLY_URL,
        'MOFO_URL': settings.MOFO_URL,
        'MOCO_URL': settings.MOCO_URL,
        'BLOG_URL': settings.BLOG_URL,
        'TECH_URL': settings.TECH_URL,
        'MYFF_URL': settings.MYFF_URL,
        'FFCLUB_URL': settings.FFCLUB_URL,
        'DEBUG': settings.DEBUG,
    }
