class persons {

    list(search) {

        let {rows} = global._require('database');

        search = search || false;
        if (search) {
            search = search.split(" ");
            search = (search.length === 1) ? search : search.join(".*");
            let regExp = new RegExp(search,"i");
            rows = rows.filter((row) => {
                return regExp.test(row.name);
            });
        }
        return rows;
    }

    add(name, email, password) {
        return {
            name,
            email,
            password
        }
    }

    delete(id) {
        return {
            id
        }
    }

}

module.exports = {
    persons
}
