import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ShortcutButton from "components/partials/ShortcutButton";
// Geonorge WebComponents
import { BreadcrumbList, ContentContainer, HeadingText } from "@kartverket/geonorge-web-components";

// Components
import CreateRegisterItem from "components/partials/CreateRegisterItem";

// Actions
import { fetchRegisterItems } from "actions/RegisterItemActions";
import { fetchOptions } from "actions/OptionsActions";

// Stylesheets
import style from "components/routes/RegisterItems.module.scss";
import { Helmet } from "react-helmet";

const RegisterItems = (userManager) => {
    const dispatch = useDispatch();

    // Redux store
    const savedRegisterItems = useSelector((state) => state.registerItems);
    const statuses = useSelector((state) => state.options.statuses);
    const auth = useSelector((state) => state.auth);
    const authToken = auth?.user || null;
    const config = useSelector((state) => state.config);

    // State
    const [registerItemsFetched, setRegisterItemsFetched] = useState(false);
    const [newRegisterItems, setNewRegisterItems] = useState(null);
    const [ownerSelected, setOwnerSelected] = useState(0);
    const [selectedTheme, setSelectedTheme] = useState([]);

    // Refs
    const tokenRef = useRef(null);

    useEffect(() => {
        tokenRef.current = authToken?.access_token?.length ? authToken.access_token : null;
    }, [authToken?.access_token]);

    useEffect(() => {
        dispatch(fetchRegisterItems(tokenRef.current)).then(() => {
            setRegisterItemsFetched(true);
            dispatch(fetchOptions());
        });
    }, [dispatch, authToken]);

    const getStatusLabel = (statuses, registerItem) => {
        return statuses && registerItem?.status && statuses?.[registerItem.status - 1]?.label?.length
            ? statuses[registerItem.status - 1].label
            : "";
    };

    const getOwners = () => {
        const uniqueOwners = [];
        const owners = [{ value: 0, label: "Alle" }];

        savedRegisterItems.forEach((item) => {
            if (!uniqueOwners.includes(item.owner.id)) {
                uniqueOwners.push(item.owner.id);
                owners.push({ value: item.owner.id, label: item.owner.name });
            }
        });

        return owners.sort((a, b) => a.label.localeCompare(b.label));
    };

    const getThemes = () => {
        return [...new Set(savedRegisterItems.map((item) => item.theme))];
    };

    const handleThemeChange = (event) => {
        const value = event.target.value;
        const isChecked = event.target.checked;

        setSelectedTheme((prevThemes) => {
            return isChecked
                ? [...prevThemes, value]
                : prevThemes.filter((theme) => theme !== value);
        });
    };

    const handleOwnerChange = (event) => {
        const owner = parseInt(event.target.value) || 0;
        setOwnerSelected(owner);
    };

    useEffect(() => {
        let filteredItems = savedRegisterItems;

        if (ownerSelected !== 0) {
            filteredItems = filteredItems.filter((item) => item.owner.id === ownerSelected);
        }

        if (selectedTheme.length > 0) {
            filteredItems = filteredItems.filter((item) => selectedTheme.includes(item.theme));
        }

        setNewRegisterItems(filteredItems);
    }, [ownerSelected, selectedTheme, savedRegisterItems]);

    const renderThemeFilters = () => {
        
        const themes = getThemes();
   

        return (
            themes.length > 1 ? (                
            <div className={style.theme}>
                
                <div className={style.themeLabel}>Vis </div>                   
                {themes.filter(theme => theme).map((theme, index) => (                                        
                    <div key={index}>
                        <input
                            type="checkbox"
                            name="theme"
                            value={theme}
                            checked={selectedTheme.includes(theme)}
                            onChange={handleThemeChange}
                        />
                        <label>{theme}</label>
                    </div>
                ))}
            </div>) : null
        );
    };

    const renderRegisterItems = (registerItems) => {
        return registerItems?.length ? (
            <>
                <div>Eier</div>
                <gn-select>
                <select name="owner" value={ownerSelected} onChange={handleOwnerChange}>
                    {getOwners().map((owner) => (
                        <option key={owner.value} value={owner.value}>
                            {owner.label}
                        </option>
                    ))}
                </select>
                </gn-select>
                {renderThemeFilters()}
                <table className={style.registerItemsTable}>
                    <thead>
                        <tr>
                            <th>Navn på veiledningstekst</th>
                            <th>Eier</th>
                            {renderThemeFilters() ? <th>Bruksområdet</th> : null}
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registerItems.map((registerItem) => (
                            <tr key={registerItem.id}>
                                <td>
                                    <Link to={`${process.env.PUBLIC_URL}/${registerItem.id}/`}>{registerItem.title}</Link>
                                </td>
                                <td>{registerItem.owner?.name || ""}</td>
                                {renderThemeFilters() ? <td>{registerItem.theme}</td> : null}
                                <td>{getStatusLabel(statuses, registerItem)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        ) : (<>
            <div>Eier</div>
                <gn-select>
                <select name="owner" value={ownerSelected} onChange={handleOwnerChange}>
                    {getOwners().map((owner) => (
                        <option key={owner.value} value={owner.value}>
                            {owner.label}
                        </option>
                    ))}
                </select>
                </gn-select>
                {renderThemeFilters()}
                <div className={style.row}>Ingen treff med valgte eier/bruksområdet</div></>
        );
    };

    if (!registerItemsFetched) return null;

    const registerItems = newRegisterItems || savedRegisterItems;

    const breadcrumbs = [
        { name: "Registrene", url: config?.registerUrl || "" },
        { name: "Veiledningstekster plan og bygg", url: "/geolett" }
    ];

    return (
        <content-container>
            <Helmet><title>Geonorge - Veiledningstekster</title></Helmet>
                        <ShortcutButton userManager={userManager} />  
            <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "20px", right: "16px" }}>
                    <a href="api/swagger">API</a>
                </div>
            </div>

            <breadcrumb-list id="breadcrumb-list" breadcrumbs={JSON.stringify(breadcrumbs)}></breadcrumb-list>
            <heading-text>
                <h1 underline="true">Veiledningstekster plan og bygg</h1>
            </heading-text>
            <div className={style.listcontainer}>
                <CreateRegisterItem />
                {renderRegisterItems(registerItems)}
            </div>
        </content-container>
    );
};

export default RegisterItems;