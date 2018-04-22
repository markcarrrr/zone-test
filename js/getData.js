class getData {
    /*
    * 'element' - node.
    * 'data' - array of objects with key 'url' for endpoint.
    */
    constructor(element, data) {
        /*
        * Make passed in 'element' available within scope.
        */
        this.element = element;

        /*
        * Make passed in 'data' available within scope.
        */
        this.data = data;

        /*
        * Set up empty array to build up our array of promises from our api endpoints.
        */
        this.promises = [];

        /*
        * Set references to the dom elements we need to access.
        */
        this.getElements();

        /*
        * Set up out event listeners.
        */
        this.setEvents();

        /*
        * Get our results on initial load.
        */
        this.getResults();

        /*
        * Check to see what the current selected filter is onload
        * and set our inital filter query.
        */
        this.setFilterQuery();

        /*
        * Set select filter form elements to be disabled.
        */
        this.isLoaded(true);
    }

    getElements() {
        /*
        * Filtering form element.
        */
        this.formElement = this.element.querySelector('.js-results-form');

        /*
        * Filtering select element.
        */
        this.filterElement = this.element.querySelector('.js-results-filter');

        /*
        * Filtering form button.
        */
       this.buttonElement = this.element.querySelector('.js-results-button');

        /*
        * Target HTML tag for outputting the results.
        */
        this.resultsElement = this.element.querySelector('.js-results-output');
    }

    setEvents() {
        /*
        * If the form is submitted let's update the results.
        */
        this.formElement.addEventListener('submit', event => {
            event.preventDefault();

            this.setFilterQuery();
            this.getResults();
        }, false);

        /*
        * On change of the select filter let's update our results.
        */
        this.filterElement.addEventListener('change', event => {
            this.setFilterQuery();
            this.getResults();
        }, false);
    }

    setFilterQuery() {
        /*
        * Get the current filtered state.
        */
        this.filterQuery = this.filterElement.options[this.filterElement.selectedIndex].value;
    }

    getResults() {
        /*
        * Let's only query our api for results if we haven't yet done so.
        */
        if (this.promises.length === 0) {
            this.data.map(data => {
                this.promises.push(this.request(data));
            });
        }

        /*
        * Set our results in the order we have requested them.
        */
        Promise.all(this.promises)
            .then(data => {
                this.setResults(data);
            });
    }

    request(data) {
        /*
        * Fetch our results from the passed in api endpoints
        * returning JSON data and catching any errors.
        */
        return fetch(data.url)
            .then(response => response.json())
            .then(results => results)
            .catch(console.log.bind(console));
    }

    mergeData(data) {
        /*
        * Let's merge our results from our multiple endpoints
        * so we have one single source.
        */
        let mergedData = [];

        data.map(results => {
            mergedData = [...mergedData, results];
        });

        return mergedData;
    }

    setResults(data) {
        /*
        * Clean out results output wrapper of any existing HTML.
        * This also clears out the initial 'loading' <li>.
        */
        this.resultsElement.innerHTML = '';

        /*
        * Filter results and output HTML template.
        */
        this.filterBy(this.mergeData(data), this.filterQuery).map((setData, index) => {
            setData.pokemon.map(item => {
                this.resultsElement.innerHTML += `
                    <li>
                        <dl>
                            <dt class="name">Name:</dt>
                            <dd class="name"><a href="${item.pokemon.url}">${item.pokemon.name}</a></dd>
                            <dt class="ability">Ability:</dt>
                            <dd class="ability">${setData.name}</dd>
                            <dt>Effect:</dt>
                            <dd>${setData.effect_entries[0].effect}</dd>
                            <dt>Generation:</dt>
                            <dd>${setData.generation.name}</dd>
                        </dl>
                    </li>
                `;
            });
        });

        /*
        * Set results form elements to be enabled now we've updated the HTML.
        */
        this.isLoaded(false);
    }

    filterBy(array) {
        /*
        * We are filtering by id.
        * If we pass in an id of 'all' let's just return everything.
        */
        if (this.filterQuery === 'all') {
            return array;
        }

        /*
        * Filter results based on the current select dropdown value.
        */
        return array.filter(data => {
            return data.id == this.filterQuery;
        });
    }

    isLoaded(boolean) {
        /*
        * Disable/enable the form button.
        */
        this.buttonElement.disabled = boolean;

        /*
        * Disable/enable the form select dropdown.
        */
        this.filterElement.disabled = boolean;
    }
}