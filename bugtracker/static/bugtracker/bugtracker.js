function PageError(props) {
    return (
        <div>
            <h1>{props.error.title ? props.error.title : "Oops!"} </h1>
            <h3>
                {props.error.message
                    ? props.error.message
                    : "An Error Occured!"}
            </h3>
        </div>
    );
}

function TicketForm(props) {
    const [ticket, setTicket] = React.useState({
        title: "",
        description: "",
        type: "Bugs/Errors",
        status: "New",
        priority: "Medium",
        assignee: "Unassigned",
        project_name: "",
    });

    const [users, setUsers] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            try {
                const response = await fetch("/userlist");
                const result = await response.json();
                setUsers(["Unassigned", ...result.users]);
                if (props.page === "Create") {
                    const res = await fetch(
                        `/project/details/${props.project_id}`
                    );
                    const result = await res.json();
                    setTicket({
                        ...ticket,
                        project_name: result.project.name,
                        project_id: props.project_id,
                    });
                }
                if (props.page === "Edit") {
                    const response = await fetch(`/ticket/details/${props.id}`);
                    const result = await response.json();
                    setTicket({
                        title: result.ticket.title,
                        description: result.ticket.description,
                        type: result.ticket.type,
                        status: result.ticket.status,
                        priority: result.ticket.priority,
                        assignee: result.ticket.assignee,
                        project_name: result.ticket.project,
                    });
                }
            } catch (e) {
                props.setHash("#errors");
            }
        })();
    }, []);

    const types = [
        "Bugs/Errors",
        "Feature Request",
        "Other Comments",
        "Training/Document Requests",
    ];

    const statuses = [
        "New",
        "Open",
        "In Progress",
        "Review",
        "Resolved",
        "Additional Info Required",
    ];

    const priorities = ["Low", "Medium", "High"];

    const selectInputs = [
        { name: "type", values: types },
        { name: "status", values: statuses },
        { name: "priority", values: priorities },
        { name: "assignee", values: users },
    ];

    const renderSelect = () => {
        return selectInputs.map((sel) => (
            <div className="mb-3">
                <label className="form-label" for={`ticket_form_${sel.name}`}>
                    Ticket {sel.name[0].toUpperCase() + sel.name.slice(1)}
                </label>
                <select
                    name={`${sel.name}`}
                    className="form-control"
                    onChange={(e) =>
                        setTicket({ ...ticket, [sel.name]: e.target.value })
                    }
                    value={ticket[sel.name]}
                >
                    {sel.values.map((val) => (
                        <option className="form-select" value={val}>
                            {val}
                        </option>
                    ))}
                </select>
            </div>
        ));
    };

    const saveTicket = async (e) => {
        e.preventDefault();
        try {
            await fetch(`/ticket/${props.page.toLowerCase()}`, {
                method: props.page === "Create" ? "POST" : "PUT",
                mode: "same-origin",
                headers: {
                    "X-CSRFToken": CSRF_TOKEN,
                },
                body: JSON.stringify({
                    ...ticket,
                    ticket_id: props.id,
                }),
            });
            location.href = "/ticket/#list";
            // props.setHash("#list");
            // history.pushState({ page: "#list" }, "", "#list");
        } catch (e) {
            props.setHash("error");
        }
    };

    return (
        <div className="card shadow p-3 ">
            <h1>{props.page} Ticket</h1>
            <h4>Project: {ticket.project_name}</h4>
            <form onSubmit={saveTicket}>
                <div className="mb-3">
                    <label for="ticket_form_title" className="form-label">
                        Ticket Title
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="title"
                        required
                        id="ticket_form_title"
                        value={ticket.title}
                        onChange={(e) =>
                            setTicket({ ...ticket, title: e.target.value })
                        }
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" for="ticket_form_description">
                        Ticket Description
                    </label>
                    <textarea
                        id="ticket_form_description"
                        className="form-control mb-3"
                        name="description"
                        value={ticket.description}
                        onChange={(e) =>
                            setTicket({
                                ...ticket,
                                description: e.target.value,
                            })
                        }
                    />
                </div>
                {renderSelect()}
                <button type="submit" class="btn btn-primary">
                    Save Ticket
                </button>
            </form>
        </div>
    );
}

function TablePagination(props) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totals, setTotals] = React.useState({
        totalCount: 1,
        totalPages: 1,
    });

    React.useEffect(() => {
        (async () => {
            const response = await fetch(`${props.url}/${currentPage}`);
            if (response.ok) {
                const result = await response.json();
                setTotals({
                    totalPages: result.total_pages,
                    totalCount: result.total_count,
                });
                props.setData(result[props.urlResponse]);
            } else {
                props.setHash("error");
            }
        })();
    }, [currentPage]);

    const loadPrevious = (e) => {
        if (currentPage <= 1) return;
        setCurrentPage(currentPage - 1);
    };
    const loadNext = () => {
        if (currentPage >= totals.totalPages) return;
        setCurrentPage(currentPage + 1);
    };

    return (
        <div class="btn-group" role="group">
            <button
                class="btn btn-outline-primary"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1}
            >
                First
            </button>
            <button
                class="btn btn-outline-primary"
                onClick={loadPrevious}
                disabled={currentPage <= 1}
            >
                Previous
            </button>

            <button
                class="btn btn-outline-primary"
                onClick={loadNext}
                disabled={totals.totalPages - currentPage <= 0}
            >
                Next
            </button>
            <button
                class="btn btn-outline-primary"
                onClick={() => setCurrentPage(totals.totalPages)}
                disabled={totals.totalPages - currentPage <= 0}
            >
                Last
            </button>
        </div>
    );
}

function TicketList(props) {
    const [data, setData] = React.useState([]);
    const [tickets, setTickets] = React.useState([]);

    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        search.length > 2
            ? setTickets(
                  data.filter((t) =>
                      t.title.toLowerCase().includes(search.toLowerCase())
                  )
              )
            : setTickets(data);
    }, [search, data]);

    const gotoPage = (url) => {
        location.href = url;
    };

    const renderRows = () => {
        return tickets.map((t) => {
            const date = new Date(t.timestamp);
            return (
                <tr>
                    <th scope="row">{t.id}</th>
                    <td>{t.title}</td>
                    <td>{t.assignee}</td>
                    <td>{t.priority}</td>
                    <td>{t.status}</td>
                    <td>{t.type}</td>
                    <td>{date.toUTCString()}</td>
                    <td>
                        <button
                            className="btn btn-light"
                            onClick={() => gotoPage(`/ticket/#edit/${t.id}`)}
                        >
                            Edit
                        </button>
                    </td>
                    <td>
                        <button
                            className="btn btn-light"
                            onClick={() => gotoPage(`/ticket/#details/${t.id}`)}
                        >
                            Details
                        </button>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="card shadow p-3 ">
            <div className="d-flex flex-row justify-content-between">
                <h1 className="d-flex">{props.title} Tickets</h1>
                <input
                    type="text"
                    className="d-flex form-control w-25"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <table class="table" id="ticket_list">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Title</th>
                        <th scope="col">Developer Assigned</th>
                        <th scope="col">Priority</th>
                        <th scope="col">Status</th>
                        <th scope="col">Type</th>
                        <th scope="col">Created</th>
                        <th scope="col"></th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>{renderRows()}</tbody>

                <TablePagination
                    url={props.listUrl}
                    urlResponse={"tickets"}
                    setData={setData}
                    setHash={props.setHash}
                />
            </table>
        </div>
    );
}

function TicketDetails(props) {
    const [ticket, setTicket] = React.useState({});
    const [ticketHistory, setTicketHistory] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`/ticket/details/${props.id}`);
                const result = await response.json();
                setTicket(result.ticket);
            } catch (e) {
                props.setHash("#error");
            }
        })();
    }, []);

    const edit = () => {
        history.pushState(
            { page: `#edit/${props.id}` },
            "",
            `#edit/${props.id}`
        );
        props.setHash(`#edit/${props.id}`);
    };

    return (
        <div>
            <div className="card shadow p-3 ">
                <div className="mb-6 d-flex justify-content-between">
                    <h1>Ticket Details</h1>
                    <div>
                        <button className="btn btn-primary" onClick={edit}>
                            Edit
                        </button>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <h4> Title</h4>
                        <p>{ticket.title}</p>
                    </div>
                    <div class="col">
                        <h4> Description</h4>
                        <p>{ticket.description}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <h4> Assigned Developer</h4>
                        <p>{ticket.assignee}</p>
                    </div>
                    <div class="col">
                        <h4> Submitter</h4>
                        <p>{ticket.creator}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <h4> Ticket Status</h4>
                        <p>{ticket.status}</p>
                    </div>
                    <div class="col">
                        <h4> Ticket Type</h4>
                        <p>{ticket.type}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <h4> Project</h4>
                        <p>{ticket.project}</p>
                    </div>
                    <div class="col">
                        <h4> Priority</h4>
                        <p>{ticket.priority}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <h4> Created</h4>
                        <p>{ticket.timestamp}</p>
                    </div>
                    <div class="col">
                        <h4> Last Update</h4>
                        <p></p>
                    </div>
                </div>
            </div>
            <div className="card mt-3 p-3 shadow">
                <h1>Ticket History</h1>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Change</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ticketHistory.map((h) => {
                            const date = new Date(h.timestamp);
                            return (
                                <tr>
                                    <td>{h.change}</td>
                                    <td>{date.toUTCString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <TablePagination
                        url={`/ticket/history/${props.id}`}
                        urlResponse={"ticket_history"}
                        setData={setTicketHistory}
                        setHash={props.setHash}
                    />
                </table>
            </div>
        </div>
    );
}

function TicketApp() {
    const apps = {
        create: () => <TicketForm page="Create" setHash={setUrlHash} />,
        edit: (id) => <TicketForm page="Edit" setHash={setUrlHash} id={id} />,
        list: () => (
            <TicketList
                setHash={setUrlHash}
                listUrl={"/ticket/all"}
                title="My"
            />
        ),
        details: (id) => <TicketDetails setHash={setUrlHash} id={id} />,
        error: (error) => <PageError error={error} />,
    };

    const [app, setApp] = React.useState({ name: "list", props: 1 });

    const [urlHash, setUrlHash] = React.useState("");

    React.useEffect(() => {
        setUrlHash(window.location.hash);
    }, []);
    const render = () => apps[app.name](app.props);

    React.useEffect(() => {
        const routeNames = Object.keys(apps);
        const route = urlHash.slice(1);
        const path = route.split("/");
        if (routeNames.includes(path[0])) {
            setApp({ name: path[0], props: path[1] });
        } else if (!urlHash) {
            setApp({ name: "list" });
        } else {
            setApp({
                name: "error",
                props: {
                    title: "404 Not found",
                    message: "Oops! An error occured",
                },
            });
        }
    }, [urlHash]);

    window.onpopstate = () => setUrlHash(window.location.hash);

    return render();
}
if (window.location.pathname === "/ticket/") {
    ReactDOM.render(<TicketApp />, document.querySelector("#ticket_app"));
}

// Project React Components

function ProjectForm(props) {
    const [project, setProject] = React.useState({
        name: "",
        description: "",
        assignees: [],
    });

    const [users, setUsers] = React.useState([]);

    React.useEffect(() => {
        (async () => {
            try {
                const response = await fetch("/userlist");
                const result = await response.json();
                setUsers(result.users);
            } catch (e) {
                props.setHash("#error");
            }
            if (props.page) {
                const response = await fetch(`/project/details/${props.id}`);
                const result = await response.json();
                console.log(result);
                setProject({
                    name: result.project.name,
                    description: result.project.description,
                    assignees: result.project.assignees,
                });
            }
        })();
    }, []);

    const handleSelect = (e) => {
        const values = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );
        console.log(values);
        setProject({ ...project, assignees: values });
    };

    const saveProject = async (e) => {
        e.preventDefault();
        console.log("project", project);
        try {
            const response = await fetch(
                `/project/${props.page.toLowerCase()}`,
                {
                    method: props.page === "Create" ? "POST" : "PUT",
                    mode: "same-origin",
                    headers: {
                        "X-CSRFToken": CSRF_TOKEN,
                    },
                    body: JSON.stringify({
                        ...project,
                        id: props.id,
                    }),
                }
            );
            console.log(await response.json());
            props.setHash("#list/1");
            history.pushState({ page: "#list/1" }, "", "#list/1");
        } catch (e) {
            console.log(e);
            props.setHash("error");
        }
    };
    return (
        <div>
            <form onSubmit={saveProject}>
                <div className="mb-3">
                    <label for="project_form_name" className="form-label">
                        Project Name
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        required
                        id="project_form_name"
                        value={project.name}
                        onChange={(e) =>
                            setProject({ ...project, name: e.target.value })
                        }
                    />
                </div>
                <div className="mb-3">
                    <label
                        for="project_form_description"
                        className="form-label"
                    >
                        Project Description
                    </label>
                    <textarea
                        className="form-control"
                        name="description"
                        required
                        id="project_form_description"
                        value={project.description}
                        onChange={(e) =>
                            setProject({
                                ...project,
                                description: e.target.value,
                            })
                        }
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" for="project_form_assigness">
                        Project Assignees
                    </label>
                    <select
                        name="assignees"
                        className="form-control"
                        onChange={handleSelect}
                        multiple
                        value={project.assignees}
                    >
                        {users.map((val) => (
                            <option className="form-select" value={val}>
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">
                    Save Project
                </button>
            </form>
        </div>
    );
}

function ProjectList(props) {
    const [data, setData] = React.useState([]);
    const [searchResults, setSearchResults] = React.useState([]);

    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        search.length > 2
            ? setSearchResults(
                  data.filter((q) =>
                      q.name.toLowerCase().includes(search.toLowerCase())
                  )
              )
            : setSearchResults(data);
    }, [search, data]);

    const gotoPage = (url) => {
        history.pushState({ page: url }, "", url);
        props.setHash(url);
    };

    const renderRows = () => {
        return searchResults.map((q) => {
            const date = new Date(q.timestamp);
            return (
                <tr>
                    <td>{q.name}</td>
                    <td>{date.toUTCString()}</td>
                    <td>
                        <button
                            className="btn btn-light"
                            onClick={() => gotoPage(`#edit/${q.id}`)}
                        >
                            Edit
                        </button>
                    </td>
                    <td>
                        <button
                            className="btn btn-light"
                            onClick={() => gotoPage(`#details/${q.id}`)}
                        >
                            Details
                        </button>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="card shadow p-3 ">
            <div className="d-flex flex-row justify-content-between">
                <h1 className="d-flex">My Projects</h1>
                <input
                    type="text"
                    className="d-flex form-control w-25"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <table class="table" id="ticket_list">
                <thead>
                    <tr>
                        <th scope="col">Project Name</th>
                        <th scope="col">Created</th>
                        <th scope="col"></th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>{renderRows()}</tbody>

                <TablePagination
                    url={"/project/all"}
                    urlResponse={"projects"}
                    setData={setData}
                    setHash={props.setHash}
                />
            </table>
        </div>
    );
}

function ProjectDetails(props) {
    const [project, setProject] = React.useState({});
    const [personnel, setPersonnel] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`/project/details/${props.id}`);
                const result = await response.json();
                setProject(result.project);
            } catch (e) {
                props.setHash("#error");
            }
        })();
    }, []);

    const gotoPage = (url) => {
        history.pushState(
            { page: `#${url}/${props.id}` },
            "",
            `#${url}/${props.id}`
        );
        props.setHash(`#${url}/${props.id}`);
    };

    return (
        <div>
            <div className="card shadow p-3 ">
                <div className="mb-6 d-flex justify-content-between">
                    <h2>Project Details</h2>
                    <div className="d-flex flex-row">
                        <div className="mx-3">
                            <button
                                className="btn btn-primary"
                                onClick={() => gotoPage("add_ticket")}
                            >
                                Add Ticket
                            </button>
                        </div>

                        <div className="mx-3">
                            <button
                                className="btn btn-primary"
                                onClick={() => gotoPage("edit")}
                            >
                                Edit Project
                            </button>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <h4> Name</h4>
                        <p>{project.name}</p>
                    </div>
                    <div class="col">
                        <h4> Description</h4>
                        <p>{project.description}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <h4> Created</h4>
                        <p>{project.timestamp}</p>
                    </div>
                    <div class="col"></div>
                </div>
            </div>
            <div className="card m-3 p-3 shadow">
                <h3>Assigned Personnel</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {personnel.map((p) => {
                            return (
                                <tr>
                                    <td>{p.username}</td>
                                    <td>{p.email}</td>
                                    <td>{p.role}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <TablePagination
                        url={`/project/assignees/${props.id}`}
                        urlResponse={"assignees"}
                        setData={setPersonnel}
                        setHash={props.setHash}
                    />
                </table>
            </div>
            <div>
                <TicketList
                    setHash={props.setHash}
                    listUrl={`/project/tickets/${props.id}`}
                    title="Project"
                />
            </div>
        </div>
    );
}

function ProjectApp() {
    const apps = {
        create: () => <ProjectForm page="Create" setHash={setUrlHash} />,
        edit: (id) => <ProjectForm page="Edit" setHash={setUrlHash} id={id} />,
        list: (page) => <ProjectList setHash={setUrlHash} page={page} />,
        details: (id) => <ProjectDetails setHash={setUrlHash} id={id} />,
        add_ticket: (id) => <TicketForm project_id={id} page="Create" />,
        error: (error) => <PageError error={error} />,
    };

    const [app, setApp] = React.useState({ name: "list", props: 1 });

    const [urlHash, setUrlHash] = React.useState("");

    React.useEffect(() => {
        setUrlHash(window.location.hash);
    }, []);
    const render = () => apps[app.name](app.props);

    React.useEffect(() => {
        const routeNames = Object.keys(apps);
        const route = urlHash.slice(1);
        const path = route.split("/");
        if (routeNames.includes(path[0])) {
            setApp({ name: path[0], props: path[1] });
        } else if (!urlHash) {
            setApp({ name: "list", props: 1 });
        } else {
            setApp({
                name: "error",
                props: {
                    title: "404 Not found",
                    message: "Oops! An error occured",
                },
            });
        }
    }, [urlHash]);

    window.onpopstate = () => setUrlHash(window.location.hash);

    return render();
}

if (window.location.pathname === "/project/") {
    ReactDOM.render(<ProjectApp />, document.querySelector("#project_app"));
}
