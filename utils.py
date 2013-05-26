
def escape_js_variables(value):
    return value.replace('\n', '\\\n').replace('\'', '\\\'')
