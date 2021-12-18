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
    });
    const [users, setUsers] = React.useState([]);
    React.useEffect(() => {
        (async () => {
            const response = await fetch("/userlist");
            if (response.ok) {
                const result = await response.json();
                setUsers(["Unassigned", ...result.users]);
            } else {
                props.setHash("#error");
            }
            if (props.page === "Edit") {
                const response = await fetch(`/ticket/details/${props.id}`);
                if (response.ok) {
                    const result = await response.json();
                    console.log(result);
                    setTicket({
                        title: result.ticket.title,
                        description: result.ticket.description,
                        type: result.ticket.type,
                        status: result.ticket.status,
                        priority: result.ticket.priority,
                        assignee: result.ticket.assignee,
                    });
                }
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
        const response = await fetch(`/ticket/${props.page.toLowerCase()}`, {
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
        if (response.ok) {
            props.setHash("#list/1");
            history.pushState({ page: "#list/1" }, "", "#list/1");
        } else {
            props.setHash("error");
        }
    };

    console.log(ticket.title);

    return (
        <div className="card shadow p-3 ">
            <h1>{props.page} Ticket</h1>
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
        setCurrentPage(props.pageNum);
    }, []);

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
        history.pushState({ page: url }, "", url);
        props.setHash(url);
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
                            onClick={() => gotoPage(`#edit/${t.id}`)}
                        >
                            Edit
                        </button>
                    </td>
                    <td>
                        <button
                            className="btn btn-light"
                            onClick={() => gotoPage(`#details/${id}`)}
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
                <h1 className="d-flex">Ticket List</h1>
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
                    url={"/ticket/all"}
                    urlResponse={"all_tickets"}
                    setData={setData}
                    pageNum={props.page}
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
            const response = await fetch(`/ticket/details/${props.id}`);
            if (response.ok) {
                const result = await response.json();
                setTicket(result.ticket);
            } else {
                setTicket(undefined);
                props.setHash("#error");
            }
        })();
    }, []);
    const error = {
        title: "404 Not Found",
        message: "Ticket Does not Exist",
    };

    const edit = () => {
        history.pushState(
            { page: `#edit/${props.id}` },
            "",
            `#edit/${props.id}`
        );
        props.setHash(`#edit/${props.id}`);
    };

    return !!ticket ? (
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
                        <p></p>
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
                        pageNum={1}
                    />
                </table>
            </div>
        </div>
    ) : (
        <PageError error={error} />
    );
}

function TicketApp() {
    const apps = {
        create: () => <TicketForm page="Create" setHash={setUrlHash} />,
        edit: (id) => <TicketForm page="Edit" setHash={setUrlHash} id={id} />,
        list: (page) => <TicketList setHash={setUrlHash} page={page} />,
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
        } else if (urlHash === "") {
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

    console.log(urlHash);

    window.onhashchange = () => console.log("Inoticed");

    return render();
}

ReactDOM.render(<TicketApp />, document.querySelector("#ticket_app"));
