class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {

        this.formElCreate = document.getElementById(formIdCreate);
        this.formElUpdate = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();

        this.selectAll();

    }

    /**
     * Realiza a edição do formulário.
     * UPDATE
     */
    onEdit() {

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {

            this.showPanelCreate();

        });

        this.formElUpdate.addEventListener("submit", (event) => {

            event.preventDefault();

            let btn = this.formElUpdate.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formElUpdate);

            let index = this.formElUpdate.dataset.trIndex;
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values)

            this.getPhoto(this.formElUpdate).then(
                (content) => {

                    if (!values.photo) {

                        result._photo = userOld._photo;

                    } else {

                        result._photo = content;

                    }

                    let user = new User();

                    user.loadFormJSON(result);

                    user.save().then(user => {

                        this.getTr(user, tr);

                        this.updateCount();

                        this.formElCreate.reset();

                        btn.disabled = false;

                        this.showPanelCreate();

                    });

                },
                (e) => {

                    console.error(e);

                }
            )

        });

    }

    /**
     * Realiza o envio do formulário.
     * CREATE
     */
    onSubmit() {

        this.formElCreate.addEventListener("submit", (event) => {

            event.preventDefault();

            let btn = this.formElCreate.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formElCreate);

            if (!values) return false;

            this.getPhoto(this.formElCreate).then(
                (content) => {

                    values.photo = content;

                    values.save().then(user => {

                        this.addLine(user);

                        this.formElCreate.reset();

                        btn.disabled = false;

                    });

                },
                (e) => {

                    console.error(e);

                }
            )

        });

    }

    /**
     * Gerencia a PHOTO carregada.
     * @param {*} f 
     */
    getPhoto(f) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...f.elements].filter((item) => {

                if (item.name === 'photo') {

                    return item;

                }

            });

            let file = elements[0].files[0];

            fileReader.onload = () => {

                resolve(fileReader.result);

            };

            fileReader.onerror = (e) => {

                reject(e);

            };

            if (file) {

                fileReader.readAsDataURL(file);

            } else {

                resolve('dist/img/default-50x50.gif');

            }

        });

    }

    /**
     * Recupera os valores do formulário.
     * @param {*} f 
     */
    getValues(f) {

        let user = {};
        let isValid = true;

        [...f.elements].forEach((field) => {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {

                field.parentElement.classList.add("has-error");
                isValid = false;

            }

            if (field.name == "gender") {

                if (field.checked) {

                    user[field.name] = field.value;

                }

            } else if (field.name == "admin") {

                user[field.name] = field.checked;

            } else {

                user[field.name] = field.value;

            }

        });

        if (!isValid) {
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );

    }

    /**
     * GET ALL
     * Recupera todos users em sessionStorage.
     */
    selectAll() {

        HttpRequest.get('/users').then(data => {

            data.users.forEach(data => {

                let user = new User();

                user.loadFormJSON(data);

                this.addLine(user);

            });

        });

    }

    /**
     * Adicionar row na TABELA.
     * @param {*} dataUser 
     */
    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();

    };

    /**
     * Gera a Tag <tr></tr> para incluir na TABELA.
     * @param {*} dataUser 
     * @param {*} tr 
     */
    getTr(dataUser, tr = null) {

        if (tr == null) tr = document.createElement("tr");

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dataFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);

        return tr;

    }

    /**
     * Adiciona os eventos as <tr></tr>
     * @param {*} tr 
     */
    addEventsTr(tr) {

        /**
         * DELETE
         */
        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if (confirm("Deseja realmente excluir?")) {

                let user = new User();

                user.loadFormJSON(JSON.parse(tr.dataset.user));

                user.delete();

                tr.remove();

                this.updateCount();

            }

        });

        /**
         * UPDATE
         */
        tr.querySelector(".btn-edit").addEventListener("click", e => {

            let json = JSON.parse(tr.dataset.user);

            this.formElUpdate.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {

                let field = this.formElUpdate.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;

                        case 'radio':
                            field = this.formElUpdate.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                            break;

                        case 'checkbox':
                            field.checked = json[name];
                            break;

                        default:
                            field.value = json[name];
                            break;
                    }

                }

            }

            this.formElUpdate.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();

        });
    }

    /**
     * Exibir Formulário CREATE e ocuta o UPDATE.
     */
    showPanelCreate() {

        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";

    }

    /**
     * Exibir Formulário UPDATE e ocuta o CREATE.
     */
    showPanelUpdate() {

        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";

    }

    /**
     * UPDATE total de usuários USERS & ADMIN.
     */
    updateCount() {

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin) numberAdmin++;

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;

    }

}