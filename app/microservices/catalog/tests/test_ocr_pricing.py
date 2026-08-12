from src.ocr_pricing import extract_price, parse_cop_value


def test_parses_explicit_cop_price():
    assert parse_cop_value("120.000") == 120000
    assert extract_price("producto\n$ 120.000")[0] == 120000


def test_accepts_unmarked_thousands_and_rejects_ambiguous_noise():
    assert extract_price("50.000")[0] == 50000
    assert extract_price("1255")[0] is None
    assert extract_price("5110.000")[0] is None


def test_ambiguous_multiple_bare_values_are_not_written():
    assert extract_price("8.25\n50.000\n120.000")[0] is None


def test_does_not_join_price_with_following_size():
    assert extract_price("$165.000\n8.")[0] == 165000
    assert extract_price("$165.0008")[0] is None
