from src.storage import build_public_url


def test_build_public_url_encodes_spaces_parentheses_and_unicode():
    url = build_public_url('uploads/deck fotos/Foto (1) - nin\u0303o.png')

    assert url.endswith('uploads/deck%20fotos/Foto%20%281%29%20-%20nin%CC%83o.png')
