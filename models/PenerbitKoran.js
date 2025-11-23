const connection = require('../configs/database')

class PenerbitKoran {
    static async getAll() {
        try {
            const [rows] = await connection.query(`select * from penerbit_koran ORDER by id asc`)
            return rows
        } catch (err) {
            throw err
        }
    }
    
    static async store(data) {
        try {
            const [result] = await connection.query('insert into penerbit_koran set ?', [data])
            return result
        } catch (err) {
            throw err
        }
    }

    static async checkPenerbitKoranCreate(data) {
        try {
            const [rows] = await connection.query(`select nama_penerbit from penerbit_koran where nama_penerbit = ?`, [data.nama_penerbit])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async getById(id) {
        try {
            const [rows] = await connection.query(`select * from penerbit_koran where id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async update(data, id) {
        try {
            const [result] = await connection.query(`update penerbit_koran set ? where id = ?`, [data, id])
        } catch (err) {
            throw err
        }
    }

    static async checkPenerbitKoranUpdate(data, id) {
        try {
            const [rows] = await connection.query(`select nama_penerbit from penerbit_koran where nama_penerbit = ? and id != ?`, [data.nama_penerbit, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async checkPenerbitKoranUsed(id) {
        try {
            const [rows] = await connection.query('select id from koran where id_penerbit_koran = ?', [id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async getFotoById(id) {
        try {
            const [rows] = await connection.query(`select foto from penerbit_koran where id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    static async delete(id) {
        try {
            const [result] = await connection.query(`delete from penerbit_koran where id = ?`, [id])
            return result
        } catch (err) {
            throw err
        }
    }
}

module.exports = PenerbitKoran