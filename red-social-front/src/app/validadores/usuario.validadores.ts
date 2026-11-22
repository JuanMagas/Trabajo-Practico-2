import { inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../servicios/auth';

// La contraseña necesita al menos una mayúscula y un número
export function requisitosClaveValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    if (valor === '') {
      return null; // de los vacíos se encarga Validators.required
    }
    const errores: ValidationErrors = {};
    if (!/[A-Z]/.test(valor)) {
      errores['sinMayuscula'] = true;
    }
    if (!/\d/.test(valor)) {
      errores['sinNumero'] = true;
    }
    return Object.keys(errores).length > 0 ? errores : null;
  };
}

// Se aplica al formulario entero: compara dos de sus campos
export function clavesCoincidenValidator(campo: string, campoRepetido: string): ValidatorFn {
  return (formulario: AbstractControl): ValidationErrors | null => {
    const clave = formulario.get(campo)?.value;
    const repetida = formulario.get(campoRepetido)?.value;
    if (repetida && clave !== repetida) {
      return { clavesNoCoinciden: true };
    }
    return null;
  };
}

// La fecha no puede ser futura
export function fechaPasadaValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const fecha = new Date(control.value);
    return fecha > new Date() ? { fechaFutura: true } : null;
  };
}
// Consulta al back si el correo o el nombre de usuario ya están en uso
export function disponibleValidator(campo: 'email' | 'username'): AsyncValidatorFn {
  const auth = inject(Auth);
  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    if (!control.value) {
      return null;
    }
    try {
      const respuesta = await firstValueFrom(auth.disponible(campo, control.value));
      return respuesta.disponible ? null : { noDisponible: true };
    } catch {
      return null; // si el back no responde, no bloqueamos: lo vuelve a revisar al registrar
    }
  };
}