// Dependencies
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Geonorge WebComponents
// eslint-disable-next-line no-unused-vars
import { BreadcrumbList, ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";

// Components
import CreateRegisterItem from "components/partials/CreateRegisterItem";

// Actions
import { fetchRegisterItems } from "actions/RegisterItemActions";
import { fetchOptions } from "actions/OptionsActions";

// Stylesheets
import style from "components/routes/RegisterItems.module.scss";

const RegisterItems = () => {
    const dispatch = useDispatch();

    // Redux store
    const savedRegisterItems = useSelector((state) => state.registerItems);
    const statuses = useSelector((state) => state.options.statuses);
    const authToken = useSelector((state) => state.authToken);
    const config = useSelector((state) => state.config);

    // State
    const [registerItemsFetched, setRegisterItemsFetched] = useState(false);
    const [newRegisterItems, setNewRegisterItems] = useState(null);
    const [ownerSelected, setOwnerSelected] = useState();
    const [sort, setSort] = useState({
        column: null,
        direction: "desc"
    });
    const [selectedTheme, setSelectedTheme] = useState();

    // Refs
    const tokenRef = useRef(null);

    useEffect(() => {
        tokenRef.current = authToken?.access_token?.length ? authToken.access_token : null;
    }, [authToken?.access_token]);
    useEffect(() => {
        if (!selectedTheme) {
            setSelectedTheme("Alle");
        }
    }, [selectedTheme]);

    useEffect(() => {
        dispatch(fetchRegisterItems(tokenRef.current)).then(() => {
            setRegisterItemsFetched(true);
            dispatch(fetchOptions()).then(() => {});
        });
    }, [dispatch, authToken]);

    const getStatusLabel = (statuses, registerItem) => {
        return statuses && registerItem?.status && statuses?.[registerItem.status - 1]?.label?.length
            ? statuses[registerItem.status - 1].label
            : "";
    };

    const getOwners = () => {
        const uniqueOwners = [];
        const owners = [];

        let allOwners = { value: 0, label: "Alle" };
        owners.unshift(allOwners);

        savedRegisterItems.forEach((item) => {
            if (uniqueOwners.indexOf(item.owner.id) === -1) {
                uniqueOwners.push(item.owner.id);
                let obj = { value: item.owner.id, label: item.owner.name };
                owners.push(obj);
            }
        });

        owners.sort((a, b) => {
            const nameA = a.label;
            const nameB = b.label;
            if (nameA < nameB) return -1;
            if (nameA < nameB) return 1;
            else return 0;
        });

        return owners;
    };
    const getThemes = () => {
        const themes = savedRegisterItems.map((item) => item.theme);
        return ["Alle", ...new Set(themes)];
    };
    const handleThemeChange = (event) => {
        setSelectedTheme(event.target.value);
        const filteredItems = event.target.value === "Alle" 
            ? savedRegisterItems 
            : savedRegisterItems.filter((item) => item.theme === event.target.value);
        setNewRegisterItems(filteredItems);
    };
    const renderThemeFilters = () => {
        const themes = getThemes();
        return (
            <div className={style.theme}>
                <div>Tema</div>
                {themes.map((theme, index) => (
                    <label key={index} className={style.themeLabel}>
                        <input
                            type="radio"
                            name="theme"
                            value={theme}
                            checked={selectedTheme === theme}
                            onChange={handleThemeChange}
                        />
                        {theme}
                    </label>
                ))}
            </div>
        );
    };
    const handleChange = (data) => {
        let ownerRegisterItems = savedRegisterItems;
        const owner = data?.target?.value && parseInt(data?.target?.value);

        if (owner !== 0) {
            ownerRegisterItems = ownerRegisterItems.filter(function (el) {
                return el.owner.id === owner;
            });
        }

        setOwnerSelected(owner);
        setNewRegisterItems(ownerRegisterItems);
    };

    const setArrow = (column) => {
        let className = "sort-direction";
        if (sort?.column === column) {
            className += sort?.direction === "asc" ? ` ${style.asc}` : ` ${style.desc}`;
        }
        return className;
    };

    const onSort = (column) => {
        return (e) => {
            const direction = sort?.column ? (sort?.direction === "asc" ? "desc" : "asc") : "asc";
            const registerItems = newRegisterItems || savedRegisterItems;
            const sortedRegisterItems = registerItems.sort((a, b) => {
                if (column === "contextType") {
                    const nameA = a.contextType;
                    const nameB = b.contextType;

                    if (nameA < nameB) return -1;
                    if (nameA < nameB) return 1;
                    else return 0;
                } else if (column === "title") {
                    const nameA = a.title;
                    const nameB = b.title;

                    if (nameA < nameB) return -1;
                    if (nameA < nameB) return 1;
                    else return 0;
                } else if (column === "owner") {
                    const nameA = a.owner.name;
                    const nameB = b.owner.name;

                    if (nameA < nameB) return -1;
                    if (nameA < nameB) return 1;
                    else return 0;
                } else if (column === "status") {
                    const nameA = getStatusLabel(statuses, a);
                    const nameB = getStatusLabel(statuses, b);

                    if (nameA < nameB) return -1;
                    if (nameA < nameB) return 1;
                    else return 0;
                } else if (column === "theme") {
                    const nameA = a.theme;
                    const nameB = b.theme;

                    if (nameA < nameB) return -1;
                    if (nameA < nameB) return 1;
                    else return 0;
                } else {
                    return a.first - b.first;
                }
            });

            if (direction === "desc") {
                sortedRegisterItems.reverse();
            }

            setNewRegisterItems(sortedRegisterItems);
            setSort({
                column,
                direction
            });
        };
    };

    const renderRegisterItems = (registerItems) => {
        const registerItemRows = registerItems?.length
            ? registerItems
                  .filter((registerItem) => {
                      return registerItem;
                  })
                  .map((registerItem) => {
                      return (
                          <tr key={registerItem.id}>
                              <td>
                                  <Link to={`${process.env.PUBLIC_URL}/${registerItem.id}/`}>
                                    {registerItem.title}  
                                  </Link>
                              </td>
                              <td>{registerItem.owner?.name || ""}</td>
                              <td>{getStatusLabel(statuses, registerItem)}</td>
                              <td>{registerItem.theme}</td>
                          </tr>
                      );
                  })
            : null;
        return registerItemRows ? (
            <React.Fragment>
                <div>Eier </div>
                <gn-select>
                    <select name="owner" defaultValue={ownerSelected || "0"} onChange={handleChange}>
                        {getOwners().map((owner) => {
                            return (
                                <option key={owner.value} value={owner.value}>
                                    {owner.label}
                                </option>
                            );
                        })}
                    </select>
                </gn-select>
                {renderThemeFilters()}  
                <table className={style.registerItemsTable}>
                    <thead>
                        <tr>
                            <th style={{ cursor: "pointer" }} onClick={onSort("title")}>
                                Navn på veiledningstekst<span className={setArrow("title")}></span>
                            </th>
                            <th style={{ cursor: "pointer" }} onClick={onSort("owner")}>
                                Eier<span className={setArrow("owner")}></span>
                            </th>
                            <th style={{ cursor: "pointer" }} onClick={onSort("status")}>
                                Status<span className={setArrow("status")}></span>
                            </th>
                            <th style={{ cursor: "pointer" }} onClick={onSort("theme")}>
                                Tema<span className={setArrow("theme")}></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>{registerItemRows}</tbody>
                </table>
            </React.Fragment>
        ) : (
            ""
        );
    };

    if (!registerItemsFetched) {
        return "";
    }
    const registerItems = newRegisterItems || savedRegisterItems;

    const breadcrumbs = [
        {
            name: "Registrene",
            url: config?.registerUrl || ""
        },
        {
            name: "Veiledningstekster plan og bygg",
            url: "/geolett"
        }
    ];

    return (
        <content-container>
            <div style={{position: 'relative'}}>
                <div style={{position: 'absolute',  top: '20px',  right: '16px'}}><a href="api/swagger">API</a></div>
            </div>
           
            <breadcrumb-list id="breadcrumb-list" breadcrumbs={JSON.stringify(breadcrumbs)}></breadcrumb-list>
            <heading-text><h1 underline="true">Veiledningstekster plan og bygg</h1></heading-text>
             <div className={style.listcontainer}>
                <CreateRegisterItem newRegisterItem />   
                      
                {renderRegisterItems(registerItems)}
            </div>
        </content-container>
    );
};

export default RegisterItems;
