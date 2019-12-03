class User {

    constructor(name, gender, birth, country, email, password, photo, admin) {

        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();

    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get birth() {
        return this._birth;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get photo() {
        return this._photo;
    }

    set photo(value) {
        this._photo = value;
    }

    get admin() {
        return this._admin;
    }

    get register() {
        return this._register;
    }

    loadFormJSON(json) {

        for (let name in json) {

            switch (name) {
                case '_register':
                    this[name] = new Date(json[name]);
                    break;

                default:
                    this[name] = json[name];
                    break;
            }

        }
    }

    toJSON() {

        let json = {};

        Object.keys(this).forEach(key => {

            if (this[key] !== undefined) json[key] = this[key];

        });

        return json;

    }

    save() {

        return new Promise((resolve, reject) => {

            let promise;

            if (this.id) {

                promise = HttpRequest.put(`/users/${this.id}`, this.toJSON());

            } else {

                promise = HttpRequest.post(`/users`, this.toJSON());

            }

            promise.then(data => {

                this.loadFormJSON(data);

                resolve(this);

            }).catch(e => {

                reject(e);

            });

        });

    }

    delete() {

        let users = User.getUsersStorage();

        users.forEach((item, index) => {

            if (this._id == item._id) {

                users.splice(index, 1);

            }

        });

        localStorage.setItem("users", JSON.stringify(users));

    }

    /**
     * Gera ID 
     */
    getNewId() {

        let users = User.getUsersStorage();

        let id;

        if (!users.length > 0) {

            id = 0;

        } else {

            id = users[users.length - 1]._id;

        }

        id++;

        return id;

        /* let lastId = parseInt(localStorage.getItem("lastId"));

        if (!lastId > 0) lestId = 0;

        lastId++;

        localStorage.setItem("lastId", lastId);

        return lastId; */

    }

    /**
     * Recupera os dados do localStorage
     */
    static getUsersStorage() {

        let users = [];

        if (localStorage.getItem("users")) {

            users = JSON.parse(localStorage.getItem("users"));

        }

        return users;

    }

}