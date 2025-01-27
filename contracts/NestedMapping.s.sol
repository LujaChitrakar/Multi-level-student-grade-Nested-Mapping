//SPDX-License-Identifier:MIT
pragma solidity ^0.8.18;

contract NestedMapping {
    // id=>name=>grade
    mapping(uint => mapping(string => bool)) private student;
    // id=>subject=>marks
    mapping(uint => mapping(string => uint)) private grade;
    string[] private subjects = ["Math", "Science", "English"];

    uint private totalStudents;
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }

    modifier _onlyOwner() {
        require(msg.sender == _owner, "Youre not owner");
        _;
    }
    function insertStudentStatus(
        uint _id,
        string memory _name,
        bool _isPassed
    ) public _onlyOwner {
        if (!getStudentPassStatus(_id, _name)) {
            totalStudents++;
        }
        student[_id][_name] = _isPassed;
    }

    function getStudentPassStatus(
        uint _id,
        string memory _name
    ) public view returns (bool) {
        return student[_id][_name];
    }

    function insertStudentMarks(
        uint _id,
        string memory _subject,
        uint _marks
    ) public {
        require(_marks >= 0 && _marks <= 100, "Enter a valid mark");
        grade[_id][_subject] = _marks;
    }

    function getStudentMarks(
        uint _id,
        string memory _subject
    ) public view returns (uint) {
        return grade[_id][_subject];
    }

    function getStudentDetails(
        uint _id,
        string memory _name
    )
        public
        view
        returns (uint id, string memory name, string[] memory, uint[] memory)
    {
        uint subjectCount = subjects.length;
        string[] memory subjectList = new string[](subjectCount);
        uint[] memory marksList = new uint[](subjectCount);
        id = _id;

        for (uint i = 0; i < subjectCount; i++) {
            subjectList[i] = subjects[i];
            marksList[i] = grade[_id][subjects[i]];
        }
        return (id, _name, subjectList, marksList);
    }

    function getTotalStudents() public view returns (uint) {
        return totalStudents;
    }
}
