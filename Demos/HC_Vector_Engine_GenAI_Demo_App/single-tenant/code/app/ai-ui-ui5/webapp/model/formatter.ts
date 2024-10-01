import DateFormat from "sap/ui/core/format/DateFormat";

export default {
    formatValue: (value: string) => {
        return value?.toUpperCase();
    },

	formatDate: (dateString: string) => {
		const dateFormatter = DateFormat.getDateTimeInstance({ pattern: "dd.MM.yyyy" });
		return dateString ? dateFormatter.format(new Date(dateString)) : null;
	},
    formatMatrix: (value: string) => (+value).toFixed(3)
};
