const connection = require('../configs/database')

class Rak {
    // mengambil semua data pada tabel rak (join dengan ruangan & lantai)
    static async getAll() {
        try {
            const [rows] = await connection.query(`SELECT ra.id, ra.kode_rak, r.kode_ruangan, l.kode_lantai FROM rak AS ra LEFT JOIN ruangan AS r ON ra.id_ruangan = r.id LEFT JOIN lantai AS l ON r.id_lantai = l.id ORDER BY id ASC`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // menyimpan data baru pada tabel rak
    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO rak SET ?`,[data])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengupdate data pada tabel rak berdasarkan id
    static async update(data, id) {
        try {
            const [result] = await connection.query(`UPDATE rak SET ? WHERE id = ?`,[data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    // menghapus data pada tabel rak berdasarkan id
    static async delete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM rak WHERE id = ?`,[id])
            return result
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah kode ruangan sudah ada untuk create
    static async checkRakCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT kode_rak FROM rak WHERE kode_rak = ?`,[data.kode_rak])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah kode rak sudah ada untuk udpate
    static async checkRakUpdate(data,id) {
        try {
            const [rows] = await connection.query(`SELECT kode_rak FROM rak WHERE kode_rak = ? and id != ?`,[data.kode_rak, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // mengambil satu data rak berdasarkan id
    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM rak WHERE id = ?`,[id])
            return rows[0] || null
        } catch (err) {
            throw err
        }
    }
}

module.exports = Rak
