class persons {

    list(search) {

        let {rows} = global._require('database');

        search = search || false;
        if (search) {
            search = search.split(" ");
            search = (search.length === 1) ? search : search.join(".*");
            let regExp = new RegExp(search, "i");
            rows = rows.filter((row) => {
                return regExp.test(row.name);
            });
        }
        return rows;
    }

    find(id) {
        let {rows} = global._require('database');
        id = id || false;
        if (!id) return null;
        rows = rows.filter((row) => {
            return row._id === id;
        });
        return rows.length > 0 ? rows[0] : null;
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
