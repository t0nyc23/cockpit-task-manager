from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()
DB_NAME = "tasks.db"

class Task(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    owner = db.Column(db.String(1000))
    title = db.Column(db.String(1000))
    description = db.Column(db.String(1000))
    status = db.Column(db.Integer)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = "paparas12"
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}'
    db.init_app(app)

    with app.app_context():
        db.create_all()

    def reset_ids():
        tasks = Task.query.order_by(Task.id).all()
        for index, task in enumerate(tasks, start=1):
            task.id = index
        db.session.commit()

    @app.route("/test")
    def test():
        return jsonify({ "message" : "works" })

    @app.route("/tasks")
    def get_tasks():
        jdata = {}
        tasks = db.session.query(Task).all()
        for task in tasks:
            jdata[task.id] = {
                "owner": task.owner,
                "title": task.title,
                "description": task.description,
                "status": task.status
            }
        return jsonify(jdata)

    @app.route("/create", methods=["POST"])
    def create_task():
        task_details = json.loads(request.data)
        task = Task(
            owner = task_details["owner"],
            title = task_details["title"],
            description = task_details["description"],
            status = task_details["status"]
        )
        db.session.add(task)
        db.session.commit()
        response = {"message": f"Created Task: {task_details}"}
        print(f"\n\nCreated task: {task_details}\n\n")
        return jsonify(response)

    @app.route("/update/<int:task_id>", methods=["GET", "PUT"])
    def update_task(task_id):
        if request.method == "GET":
            task_details = db.session.query(Task).get(task_id)
            json_details = {
                "id": task_id,
                "owner" : task_details.owner,
                "title" : task_details.title,
                "description" : task_details.description,
                "status" : task_details.status
            }
            print(f"\n\nSending task for edit:\n{json_details}\n\n")
            return jsonify(json_details)

        elif request.method == "PUT":
            task_details = json.loads(request.data)

            if task_details['status'] == "Pending":
                status_num = 0
            elif task_details['status'] == "Completed":
                status_num = 1
            elif task_details['status'] == "Canceled":
                status_num = 2
            else:
                print(f"Could not updated task (no valid task status): {task_details['status']}")
                response = {"message" : f"Could Not Update Task With ID: {task_id}"}
                return jsonify(response)

            task_update = db.session.query(Task).get(task_details['id'])
            if task_update:
                task_update.owner = task_details['owner']
                task_update.title= task_details['title']
                task_update.description= task_details['description']
                task_update.status= status_num
                db.session.commit()
                message = {"message": f"Updated task: {task_details}"}
                print(f"\n\nUpdated task: {task_details}\n\n")
                return jsonify(message)
            else:
                response = {"message" : f"Could Not Update Task With ID: {task_id}"}
                return jsonify(response)

    @app.route("/delete/<int:task_id>", methods=['DELETE'])
    def delete_task(task_id):
        print("here")
        task_delete = db.session.query(Task).get(task_id)
        if task_delete:
            db.session.delete(task_delete)
            db.session.commit()
            reset_ids()
        else:
            response = {"message" : f"Could Not Delete Task With ID: {task_id}"}
            return jsonify(response)
        response = {"message": "ok"}
        return jsonify(response)

    return app






















