function Dashboard({stats}) {
    return(
        <div className="row mb-4">

  <div className="col">
    <div className="card p-3 text-center">
      <h5>Total Tasks</h5>
      <h3>{stats.totalTasks}</h3>
    </div>
  </div>

  <div className="col">
    <div className="card p-3 text-center">
      <h5>Completed</h5>
      <h3>{stats.completedTasks}</h3>
    </div>
  </div>

  <div className="col">
    <div className="card p-3 text-center">
      <h5>Pending</h5>
      <h3>{stats.pendingTasks}</h3>
    </div>
  </div>

</div>
    );
}

export default Dashboard;