const connection = require('../configs/database')

class Bahasa {
    // mengambil semua data pada tabel bahasa
    static async getAll() {
        try {
            const [rows] = await connection.query(`SELECT * FROM bahasa ORDER BY id ASC`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // menyimpan data baru pada tabel bahasa
    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO bahasa SET ?`, [data])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengupdate data pada tabel bahasa berdasarkan id
    static async update(data, id) {
        try {
            const [result] = await connection.query(`UPDATE bahasa SET ? WHERE id = ?`, [data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengambil satu data bahasa berdasarkan id
    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM bahasa WHERE id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    // menghapus data pada tabel bahasa berdasarkan id
    static async delete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM bahasa WHERE id = ?`, [id])
            return result
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah bahasa sudah ada untuk create
    static async checkBahasaCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT bahasa FROM bahasa WHERE bahasa = ?`, [data.bahasa])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah bahasa sudah ada untuk update
    static async checkBahasaUpdate(data, id) {
        try {
            const [rows] = await connection.query(`SELECT bahasa FROM bahasa WHERE bahasa = ? and id != ?`, [data.bahasa, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah bahasa sudah digunakan
    static async checkBahasaUsed(id) {
        try {
            const [rowsBuku] = await connection.query(`SELECT id FROM buku WHERE id_bahasa = ?`, [id])
            const [rowsMajalah] = await connection.query(`SELECT id FROM majalah WHERE id_bahasa = ?`, [id])
            return rowsBuku.length > 0 || rowsMajalah.length > 0
        } catch (err) {
            throw err
        }
    }
}

module.exports = Bahasa
