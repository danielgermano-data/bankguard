from etl.validators.cpf import is_valid_cpf, only_digits


def test_only_digits_removes_formatting() -> None:
    assert only_digits("529.982.247-25") == "52998224725"


def test_valid_cpf_returns_true() -> None:
    assert is_valid_cpf("52998224725")


def test_invalid_cpf_returns_false() -> None:
    assert not is_valid_cpf("12345678900")


def test_repeated_digits_cpf_returns_false() -> None:
    assert not is_valid_cpf("11111111111")
