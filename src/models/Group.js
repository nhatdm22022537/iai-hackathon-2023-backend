export class Group {
    overallRanking = [];
    constructor(groupId, ownerId, name, description, members, rooms, courses) {
        // info
        this.groupId = groupId;
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;

        // property
        this.members = members;
        this.rooms = rooms;
        this.courses = courses;
    }

    // getters
    infoToJSON() {
        return {
            groupId: this.groupId,
            ownerId: this.ownerId,
            name: this.name,
            description: this.description,
        };
    }

    // setters
    // group's id and owner's uid cannot be changed
    set setMembers(members) {
        this.members = members;
    }
    set setCourses(courses) {
        this.courses = courses;
    }

    addMember(member) {
        this.members[member.id] = member;
    }
    addRoom(room) {
        this.rooms[room.id] = room;
    }
    addCourse(course) {
        this.courses[course.name] = course;
    }
}


