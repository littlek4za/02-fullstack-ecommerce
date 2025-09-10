import { FormControl, ValidationErrors } from "@angular/forms";

export class CustomCOFormValidator {

    //whitespace validation
    static notOnlyWhiteSpace(control: FormControl) : ValidationErrors | null{

        //check if string only contains whitespace
        if((control.value != null) && (control.value.trim().length === 0)) {

            //invalid, return error object
            return {'notOnlyWhiteSpace': true};
        }
        else {
            //valid, retunr null
            return null;
        }
    }
}
