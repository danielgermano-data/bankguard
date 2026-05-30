def only_digits(value: object) -> str:
    return "".join(char for char in str(value) if char.isdigit())


def is_valid_cpf(value: object) -> bool:
    cpf = only_digits(value)

    if len(cpf) != 11:
        return False

    if cpf == cpf[0] * 11:
        return False

    first_sum = sum(int(cpf[index]) * (10 - index) for index in range(9))
    first_digit = (first_sum * 10) % 11
    first_digit = 0 if first_digit == 10 else first_digit

    second_sum = sum(int(cpf[index]) * (11 - index) for index in range(10))
    second_digit = (second_sum * 10) % 11
    second_digit = 0 if second_digit == 10 else second_digit

    return first_digit == int(cpf[9]) and second_digit == int(cpf[10])
