// Convierte una duración expresada en texto a milisegundos.
export function durationToMilliseconds(duration) {

    const match = /^(\d+)(s|m|h|d)$/.exec(duration);

    if (!match) {

        throw new Error(
            "Formato de duración inválido."
        );

    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return value * multipliers[unit];
}