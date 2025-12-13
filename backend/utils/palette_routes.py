from flask import Blueprint, request, jsonify
from utils.palette_db import get_db

palette_bp = Blueprint("palette", __name__)

@palette_bp.route("/api/palettes/save", methods=["POST"])
def save_palette():
    data = request.json or {}

    conn = get_db()
    conn.execute("""
        INSERT INTO color_palettes
        (primary_color, secondary_color, accent_color, bg_color, usage_count)
        VALUES (?, ?, ?, ?, 1)
        ON CONFLICT(primary_color, secondary_color, accent_color, bg_color)
        DO UPDATE SET usage_count = usage_count + 1
    """, (
        data.get("primaryColor"),
        data.get("secondaryColor"),
        data.get("accentColor"),
        data.get("bgColor")
    ))
    conn.commit()
    conn.close()

    return jsonify({"success": True})


@palette_bp.route("/api/palettes/frequent", methods=["GET"])
def get_frequent_palettes():
    conn = get_db()
    rows = conn.execute("""
        SELECT primary_color, secondary_color, accent_color, bg_color
        FROM color_palettes
        ORDER BY usage_count DESC
        LIMIT 6
    """).fetchall()
    conn.close()

    return jsonify([dict(r) for r in rows])

