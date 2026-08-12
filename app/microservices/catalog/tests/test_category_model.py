from sqlalchemy import String

from src.models import Category


def test_category_has_nullable_category_group_column():
    column = Category.__table__.columns["category_group"]

    assert isinstance(column.type, String)
    assert column.type.length == 32
    assert column.nullable is True
    assert not column.index
