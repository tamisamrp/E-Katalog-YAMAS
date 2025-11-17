const connection = require('../configs/database')

class Ruangan {
    // mengambil semua data pada tabel ruangan (join dengan lantai)
    static async getAll() {
        try {
            const [rows] = await connection.query(`SELECT r.id, r.kode_ruangan, l.kode_lantai FROM ruangan AS r LEFT JOIN lantai AS l ON r.id_lantai = l.id ORDER BY id ASC`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // menyimpan data baru pada tabel ruangan
    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO ruangan SET ?`,[data])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengupdate data pada tabel ruangan berdasarkan id
    static async update(data, id) {
        try {
            const [result] = await connection.query(`UPDATE ruangan SET ? WHERE id = ?`,[data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengambil satu data ruangan berdasarkan id
    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM ruangan WHERE id = ?`,[id])
            return rows[0] || null
        } catch (err) {
            throw err
        }
    }

    // menghapus data pada tabel ruangan berdasarkan id
    static async delete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM ruangan WHERE id = ?`,[id])
            return result
        } catch (err) {
            throw err
        }
    }

    // cek apakah kode_ruangan sudah ada untuk create
    static async checkKodeRuanganCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT * FROM ruangan WHERE kode_ruangan = ?`,[data.kode_ruangan])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }


    // memeriksa apakah rak sudah digunakan
    static async checkRakUsed(id) {
        try {
            const [rows] = await connection.query(`SELECT id FROM rak WHERE id_ruangan = ?`, [id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memeriksa apakah kode_lantai sudah ada untuk update
    static async checkRuanganUpdate(data, id) {
        try {
            const [rows] = await connection.query(`SELECT kode_ruangan FROM ruangan WHERE kode_ruangan = ? and id != ?`, [data.kode_ruangan, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }
}

module.exports = Ruangan
