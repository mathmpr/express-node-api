let fs = require('fs');

class log_request {

    log(request, data) {
        let file = this.install_fs();
        fs.appendFileSync(file, this.get_date() + ': data => '+ data +' => ' + JSON.stringify({
            body: request.body,
            baseUrl: request.baseUrl,
            originalUrl: request.originalUrl,
            params: request.params,
            accepted: request.accepted,
            credentials: request.credentials,
            ip: request.ip,
            method: request.method,
            protocol: request.protocol,
            query: request.query,
        }, null, 2) + "\n", {
            flags: 'a+'
        });
    }

    get_date() {
        let monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        let dateObj = new Date();
        let month = monthNames[dateObj.getMonth()];
        let day = String(dateObj.getDate()).padStart(2, '0');
        let year = dateObj.getFullYear();

        let hour = dateObj.getHours();
        let minute = dateObj.getMinutes();
        let second = dateObj.getSeconds();

        hour = (('' + hour).length === 1 ? '0' + hour : hour);
        minute = (('' + minute).length === 1 ? '0' + minute : minute);
        second = (('' + second).length === 1 ? '0' + second : second);

        return day + ' of ' + month + ', ' + year + ' ' + hour + ':' + minute + ':' + second;
    }

    /**
     * create log directory and create one file for each day
     * if file of the day exists, return path of this existent file
     */
    install_fs() {
        if (!fs.existsSync(global.root + 'request_logs')) {
            fs.mkdirSync(global.root + 'request_logs');
        }
        let date = new Date();
        date.setSeconds(0);
        date.setHours(0);
        date.setMilliseconds(0);
        date.setMinutes(0);
        date = ((+date) + '').slice(0, -4);
        let file = global.root + 'request_logs/' + date + '_requests.log';
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, '');
        }
        return file;
    }

}

module.exports = {
    log_request: new log_request()
}
