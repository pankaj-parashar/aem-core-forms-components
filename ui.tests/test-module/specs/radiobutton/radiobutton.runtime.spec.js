/*******************************************************************************
 * Copyright 2022 Adobe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
describe("Form with Radio Button Input", () => {

    const pagePath = "content/forms/af/core-components-it/samples/radiobutton/basic.html";
    let formContainer = null;
    const bemBlock = 'cmp-adaptiveform-radiobutton';
    /**
     * initialization of form container before every test
     * */
    beforeEach(() => {
        cy.previewForm(pagePath).then(p => {
            formContainer = p;
        })
    });

    const checkHTML = (id, state) => {
        const visible = state.visible;
        const passVisibleCheck = `${visible === true ? "" : "not."}be.visible`;
        const passDisabledAttributeCheck = `${state.enabled === false || state.readOnly === true ? "" : "not."}have.attr`;
        cy.get(`#${id}`)
            .should(passVisibleCheck)
            .invoke('attr', 'data-cmp-visible')
            .should('eq', visible.toString());
        cy.get(`#${id}`)
            .invoke('attr', 'data-cmp-enabled')
            .should('eq', state.enabled.toString());
        return cy.get(`#${id}`).within((root) => {
            cy.get('*').should(passVisibleCheck);
            cy.get('input')
                .should('have.length', 2);
            cy.get('input')
                .should(passDisabledAttributeCheck, 'disabled');
            cy.get('input').eq(0).should('be.checked');
        })
    }

    it("radiobutton should get model and view initialized properly", () => {
        expect(formContainer, "formcontainer is initialized").to.not.be.null;
        expect(formContainer._model.items.length, "model and view elements match").to.equal(Object.keys(formContainer._fields).length);
        Object.entries(formContainer._fields).forEach(([id, field]) => {
            expect(field.getId()).to.equal(id);
            expect(formContainer._model.getElement(id), `model and view are in sync`).to.equal(field.getModel());
        });
    });

    it("radiobutton model's changes are reflected in the html", () => {
        const [id, fieldView] = Object.entries(formContainer._fields)[0];

        // checking alignment  of radio button in runtime
        cy.get(`#${id}`).find(".cmp-adaptiveform-radiobutton__widget").should('have.class', 'VERTICAL');
        const [id2, fieldView2] = Object.entries(formContainer._fields)[1];
        cy.get(`#${id2}`).find(".cmp-adaptiveform-radiobutton__widget").should('have.class', 'HORIZONTAL');

        // check model's change is reflected in HTML
        const model = formContainer._model.getElement(id);
        const val = Array('0','1');
        model.value = '0';
        checkHTML(model.id, model.getState()).then(() => {
            model.visible = false;
            return checkHTML(model.id, model.getState());
        }).then(() => {
            model.enable = false;
            return checkHTML(model.id, model.getState());
        });
    });

    it("radiobutton html changes are reflected in model", () => {
        const [id, fieldView] = Object.entries(formContainer._fields)[1];
        const model = formContainer._model.getElement(id);

        // check the default value to be selected as 0
        expect(model.getState().value).to.equal('0');

        cy.get(`#${id}`).find("input").eq(1).click().then(x => {
            expect(model.getState().value).to.equal('1');
        });
        cy.get(`#${id}`).find("input").eq(3).click().then(x => {
            expect(model.getState().value).to.equal('3');
        });
    });

    it("radiobutton should show error messages in the HTML", () => {
        const [id, fieldView] = Object.entries(formContainer._fields)[0];
        formContainer._model.validate();
        cy.get(`#${id}`).find(".cmp-adaptiveform-radiobutton__errormessage").should('have.text',"This is a required radiobutton");

        cy.get(`#${id}`).find("input").eq(1).click().then(x => {
            cy.get(`#${id}`).find(".cmp-adaptiveform-radiobutton__errormessage").should('have.text',"");
        });
    });

    it("should toggle description and tooltip", () => {
        cy.toggleDescriptionTooltip(bemBlock, 'tooltip_scenario_test');
    })

    it("should show and hide components on certain select", () => {
        // Rule on radioButton1: When radioButton2 has Item 1 selected => Show radioButton3 and Hide radioButton4

        const [radioButton1, radioButton1FieldView] = Object.entries(formContainer._fields)[0];
        const [radioButton3, radioButton3FieldView] = Object.entries(formContainer._fields)[2];
        const [radioButton4, radioButton4FieldView] = Object.entries(formContainer._fields)[3];

        cy.get(`#${radioButton1}`).find("input").first().check().blur().then(x => {
            cy.get(`#${radioButton3}`).should('be.visible')
            cy.get(`#${radioButton4}`).should('not.be.visible')
        })
    })

    it("should enable and disable components on certain select", () => {
        // Rule on radioButton1: When radioButton2 has Item 2 selected => Enable radioButton4 and Disable radioButton2

        const [radioButton1, radioButton1FieldView] = Object.entries(formContainer._fields)[0];
        const [radioButton2, radioButton2FieldView] = Object.entries(formContainer._fields)[1];
        const [radioButton4, radioButton4FieldView] = Object.entries(formContainer._fields)[3];

        cy.get(`#${radioButton1}`).find("input").check("1").blur().then(x => {
            cy.get(`#${radioButton4}`).find("input").should('be.enabled')
            cy.get(`#${radioButton2}`).find("input").should('not.be.enabled')
        })
    })

    it("should show validation error messages based on expression rule", () => {
        // Rule on radioButton6: Validate radioButton6 using Expression: radioButton6 === radioButton5

        const [radioButton5, radioButton5FieldView] = Object.entries(formContainer._fields)[4];
        const [radioButton6, radioButton6FieldView] = Object.entries(formContainer._fields)[5];

        cy.get(`#${radioButton5}`).find("input").check(["1"]).then(x => {
            cy.get(`#${radioButton6}`).find("input").check(["0"])
            cy.get(`#${radioButton6}`).find(".cmp-adaptiveform-radiobutton__errormessage").should('have.text', "Please enter a valid value.")

            cy.get(`#${radioButton6}`).find("input").check(["1"])
            cy.get(`#${radioButton6}`).find(".cmp-adaptiveform-radiobutton__errormessage").should('have.text', "")
        })
    })

    it("should set and clear value based on rules", () => {
        // Rule on radioButton4: When input has Item1 selected, set value of radioButton6 to "Item 2" and clear value of radioButton1

        const [radioButton1, radioButton1FieldView] = Object.entries(formContainer._fields)[0];
        const [radioButton6, radioButton6FieldView] = Object.entries(formContainer._fields)[5];
        const [radioButton4, radioButton4FieldView] = Object.entries(formContainer._fields)[3];

        cy.get(`#${radioButton1}`).find("input").check("1")
        cy.get(`#${radioButton4}`).find("input").check("0").blur().then(x => {
            cy.get(`#${radioButton6}`).find("input").should('be.checked')
            cy.get(`#${radioButton1}`).find("input").should('not.be.checked')
        })
    })

    it("should update enum values on providing duplicate enums", () => {

        const [radioButton7, radioButton7FieldView] = Object.entries(formContainer._fields)[6];
        cy.get(`#${radioButton7}`).find(".cmp-adaptiveform-radiobutton__option").should('have.length', 2);
        cy.get(`#${radioButton7}`).find(".cmp-adaptiveform-radiobutton__option-label").contains('Item 3');
        cy.get(`#${radioButton7}`).find(".cmp-adaptiveform-radiobutton__option-label").contains('Item 2');
        cy.get(`#${radioButton7}`).find(".cmp-adaptiveform-radiobutton__option-label").contains('Item 1').should('not.exist');

    })

    it("decoration element should not have same class name", () => {
        expect(formContainer, "formcontainer is initialized").to.not.be.null;
        cy.wrap().then(() => {
            const id = formContainer._model._children[0].id;
            cy.get(`#${id}`).parent().should("not.have.class", bemBlock);
        })
    })

    it("should add filled/empty class at container div", () => {
      const [radioButton1, radioButton1FieldView] = Object.entries(formContainer._fields)[0];
      cy.get(`#${radioButton1}`).should('have.class', 'cmp-adaptiveform-radiobutton--empty');
      cy.get(`#${radioButton1}`).invoke('attr', 'data-cmp-required').should('eq', 'true');
      cy.get(`#${radioButton1}`).invoke('attr', 'data-cmp-readonly').should('eq', 'false');
      cy.get(`#${radioButton1}`).find("input").check("1").blur().then(x => {
        cy.get(`#${radioButton1}`).should('have.class', 'cmp-adaptiveform-radiobutton--filled');
      })
    })
})