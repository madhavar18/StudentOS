function FilterBar({setFilter}) {
    return(
        <div className="mb-3">

<button className="btn btn-secondary me-2" onClick={() => setFilter("all")}>
All
</button>

<button className="btn btn-secondary me-2" onClick={() => setFilter("pending")}>
Pending
</button>

<button className="btn btn-secondary me-2" onClick={() => setFilter("completed")}>
Completed
</button>

<button className="btn btn-secondary me-2" onClick={() => setFilter("assignment")}>
Assignments
</button>

<button className="btn btn-secondary me-2" onClick={() => setFilter("project")}>
Projects
</button>

<button className="btn btn-secondary" onClick={() => setFilter("exam")}>
Exams
</button>

</div>

    );
}

export default FilterBar;